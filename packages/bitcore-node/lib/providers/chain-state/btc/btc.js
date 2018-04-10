const JSONStream = require('JSONStream');
const ListTransactionsStream = require('./transforms');
const Storage = require('../../../services/storage');
const mongoose = require('mongoose');
const Wallet = mongoose.model('Wallet');
const WalletAddress = mongoose.model('WalletAddress');
const Transaction = mongoose.model('Transaction');
const Coin = mongoose.model('Coin');
const Block = mongoose.model('Block');

function BTCStateProvider(chain) {
  this.chain = chain || 'BTC';
  this.chain = this.chain.toUpperCase();
}

BTCStateProvider.prototype.streamAddressUtxos = function(
  network,
  address,
  stream,
  args
) {
  if (typeof address !== 'string' || !this.chain || !network) {
    throw 'Missing required param';
  }
  network = network.toLowerCase();
  let query = { chain: this.chain, network, address };
  const unspent = args.unspent;
  if (unspent) {
    query.spentHeight = { $lt: 0 };
  }
  Storage.apiStreamingFind(Coin, query, stream);
};

BTCStateProvider.prototype.getBalanceForAddress = function(network, address) {
  let query = { chain: this.chain, network, address };
  return Coin.getBalance({ query }).exec();
};

BTCStateProvider.prototype.getBalanceForWallet = async function(walletId) {
  let query = { wallets: walletId };
  return Coin.getBalance({ query }).exec();
};

BTCStateProvider.prototype.getBlocks = async function(
  network,
  sinceBlock,
  args
) {
  let { limit } = args || {};
  if (!this.chain || !network) {
    throw 'Missing required param';
  }
  network = network.toLowerCase();
  let query = { chain: this.chain, network, processed: true };
  if (sinceBlock) {
    let height = parseInt(sinceBlock, 10);
    if (Number.isNaN(height) || height.toString(10) !== sinceBlock) {
      throw 'invalid block id provided';
    }
    query.height = { $gt: height };
  }
  let blocks = await Block.find(query)
    .sort({ height: -1 })
    .limit(limit || 100)
    .exec();
  if (!blocks) {
    throw 'blocks not found';
  }
  let transformedBlocks = blocks.map(block =>
    Block._apiTransform(block, { object: true })
  );
  return transformedBlocks;
};

BTCStateProvider.prototype.getBlock = async function(network, blockId) {
  if (typeof blockId !== 'string' || !this.chain || !network) {
    throw 'Missing required param';
  }
  network = network.toLowerCase();
  let query = { chain: this.chain, network, processed: true };
  if (blockId.length === 64) {
    query.hash = blockId;
  } else {
    let height = parseInt(blockId, 10);
    if (Number.isNaN(height) || height.toString(10) !== blockId) {
      throw 'invalid block id provided';
    }
    query.height = height;
  }
  let block = await Block.findOne(query).exec();
  if (!block) {
    throw 'block not found';
  }
  return Block._apiTransform(block, { object: true });
};

BTCStateProvider.prototype.streamTransactions = function(
  network,
  stream,
  args
) {
  if (!this.chain || !network) {
    throw 'Missing chain or network';
  }
  network = network.toLowerCase();
  let query = { chain: this.chain, network };
  if (args.blockHeight) {
    query.blockHeight = parseInt(args.blockHeight);
  }
  if (args.blockHash) {
    query.blockHash = args.blockHash;
  }
  Transaction.getTransactions({ query })
    .pipe(JSONStream.stringify())
    .pipe(stream);
};

BTCStateProvider.prototype.streamTransaction = function(network, txId, stream) {
  if (typeof txId !== 'string' || !this.chain || !network || !stream) {
    throw 'Missing required param';
  }
  network = network.toLowerCase();
  let query = { chain: this.chain, network, txid: txId };
  Transaction.getTransactions({ query })
    .pipe(JSONStream.stringify())
    .pipe(stream);
};

BTCStateProvider.prototype.createWallet = async function(
  network,
  name,
  pubKey,
  args
) {
  if (typeof name !== 'string' || !network) {
    throw 'Missing required param';
  }
  return Wallet.create({
    chain: this.chain,
    network,
    name,
    pubKey,
    path: args.path
  });
};

BTCStateProvider.prototype.getWallet = async function(network, walletId) {
  let wallet = await Wallet.findOne({ _id: walletId }).exec();
  return wallet;
};

BTCStateProvider.prototype.streamWalletAddresses = function(
  network,
  walletId,
  stream
) {
  let query = { wallet: walletId };
  Storage.apiStreamingFind(WalletAddress, query, stream);
};

BTCStateProvider.prototype.updateWallet = async function(
  network,
  wallet,
  addresses
) {
  return WalletAddress.updateCoins(
    wallet,
    addresses
  );
};

BTCStateProvider.prototype.streamWalletTransactions = async function(
  network,
  wallet,
  stream,
  args
) {
  let query = {
    chain: this.chain,
    network,
    wallets: wallet._id
  };
  if (args) {
    if (args.startBlock) {
      query.blockHeight = { $gte: parseInt(args.startBlock) };
    }
    if (args.endBlock) {
      query.blockHeight = query.blockHeight || {};
      query.blockHeight.$lte = parseInt(args.endBlock);
    }
    if (args.startDate) {
      query.blockTimeNormalized = { $gte: new Date(args.startDate) };
    }
    if (args.endDate) {
      query.blockTimeNormalized = query.blockTimeNormalized || {};
      query.blockTimeNormalized.$lt = new Date(args.endDate);
    }
  }
  let transactionStream = Transaction.getTransactions({ query });
  let listTransactionsStream = new ListTransactionsStream(wallet);
  transactionStream.pipe(listTransactionsStream).pipe(stream);
};

BTCStateProvider.prototype.getWalletBalance = async function(
  network,
  walletId
) {
  let query = { wallets: mongoose.Types.ObjectId(walletId) };
  return Coin.getBalance({ query }).exec();
};

BTCStateProvider.prototype.streamWalletUtxos = function(
  network,
  walletId,
  stream,
  args
) {
  let query = { wallets: walletId, spentHeight: { $lt: 0 } };
  args = args || {};
  if (args.spent) {
    query.spentHeight = { $gt: 0 };
  }
  Storage.apiStreamingFind(Coin, query, stream);
};

/*
 *BTCStateProvider.prototype.broadcastTransaction = async function(network, tx) {
 *  return this.get(chain).broadcastTransaction(tx);
 *};
 */

module.exports = BTCStateProvider;
