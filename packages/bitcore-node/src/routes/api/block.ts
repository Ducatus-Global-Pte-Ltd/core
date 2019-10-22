import { Request, Response } from 'express';
import { ChainStateProvider } from '../../providers/chain-state';
import { SetCache, CacheTimes, Confirmations } from '../middleware';
import { BitcoinBlockStorage } from '../../models/block';
import { TransactionStorage } from '../../models/transaction';
import { CoinStorage } from '../../models/coin';

const router = require('express').Router({ mergeParams: true });

router.get('/', async function(req: Request, res: Response) {
  let { chain, network } = req.params;
  let { sinceBlock, date, limit, since, direction, paging } = req.query;
  if (limit) {
    limit = parseInt(limit);
  }
  try {
    let payload = {
      chain,
      network,
      sinceBlock,
      args: { date, limit, since, direction, paging },
      req,
      res
    };
    return ChainStateProvider.streamBlocks(payload);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/tip', async function(req: Request, res: Response) {
  let { chain, network } = req.params;
  try {
    let tip = await ChainStateProvider.getBlock({ chain, network });
    return res.json(tip);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
});

router.get('/:blockId', async function(req: Request, res: Response) {
  let { blockId, chain, network } = req.params;
  try {
    let block = await ChainStateProvider.getBlock({ chain, network, blockId });
    if (!block) {
      return res.status(404).send('block not found');
    }
    const tip = await ChainStateProvider.getLocalTip({ chain, network });
    if (block && tip && tip.height - block.height > Confirmations.Deep) {
      SetCache(res, CacheTimes.Month);
    }
    return res.json(block);
  } catch (err) {
    return res.status(500).send(err);
  }
});

//return all { txids, inputs, ouputs} for a blockHash paginated at max 500 per page, to limit reqs and overload
router.get('/:blockHash/coins/:limit/:pgnum', async function(req: Request, res: Response) {
  let { chain, network, blockHash, limit, pgnum } = req.params;

  let pageNumber;
  let maxLimit;
  try {
    pageNumber = parseInt(pgnum, 10);
    maxLimit = parseInt(limit, 10);

    if (maxLimit) {
      if (maxLimit > 500) maxLimit = 500;
    }
  } catch (err) {
    console.log(err);
  }

  let skips = maxLimit * (pageNumber - 1);
  let numOfTxs = await TransactionStorage.collection.find({ chain, network, blockHash }).count();
  try {
    let txs =
      numOfTxs < maxLimit
        ? await TransactionStorage.collection.find({ chain, network, blockHash }).toArray()
        : await TransactionStorage.collection
            .find({ chain, network, blockHash })
            .skip(skips)
            .limit(maxLimit)
            .toArray();

    if (!txs) {
      return res.status(422).send('No txs for page');
    }

    const txidIndexes: any = {};
    let txids = txs.map((tx, index) => {
      txidIndexes[index] = tx.txid;
      return tx.txid;
    });

    let inputs = await CoinStorage.collection
      .find({ chain, network, spentTxid: { $in: txids } })
      .addCursorFlag('noCursorTimeout', true)
      .toArray();

    let outputs = await CoinStorage.collection
      .find({ chain, network, mintTxid: { $in: txids } })
      .addCursorFlag('noCursorTimeout', true)
      .toArray();

    let prevPageNum;
    let nxtPageNum;
    let previous = '';
    let next = '';
    if (pageNumber !== 1) {
      prevPageNum = parseInt(pgnum) - 1;
      previous = `/block/${blockHash}/coins/${limit}/${prevPageNum}`;
    }
    if (numOfTxs - maxLimit * pageNumber > 0) {
      nxtPageNum = pgnum + 1;
      next = `/block/${blockHash}/coins/${limit}/${nxtPageNum}`;
    }

    return res.json({ txids, inputs, outputs, previous, next });
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/before-time/:time', async function(req: Request, res: Response) {
  let { time, chain, network } = req.params;
  try {
    const [block] = await BitcoinBlockStorage.collection
      .find({
        chain,
        network,
        timeNormalized: { $lte: new Date(time) }
      })
      .limit(1)
      .sort({ timeNormalized: -1 })
      .toArray();

    if (!block) {
      return res.status(404).send('block not found');
    }
    const tip = await ChainStateProvider.getLocalTip({ chain, network });
    if (block && tip && tip.height - block.height > Confirmations.Deep) {
      SetCache(res, CacheTimes.Month);
    }
    return res.json(block);
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = {
  router: router,
  path: '/block'
};
