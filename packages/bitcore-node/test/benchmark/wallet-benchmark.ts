import { CoinModel } from '../../src/models/coin';
import { Wallet } from 'bitcore-client';
import { Storage } from '../../src/services/storage';

async function getAllAddressesFromBlocks(start, end) {
  // should fetch 1248170 addresses
  if (!Storage.connected) await Storage.start({});
  const addresses = await CoinModel.collection
    .find({ chain:'BTC', network: 'mainnet', mintHeight: { $gte: start, $lte: end } })
    .project({ address: 1 })
    .toArray();
  return addresses.map(a => a.address);
}

async function createWallet(addresses: string[], iteration) {
  const walletName = 'Benchmark Wallet' + iteration;
  const password = 'iamsatoshi';
  const chain = 'BTC';
  const network = 'mainnet';
  const baseUrl = 'http://localhost:3000/api';
  let lockedWallet: Wallet;

  try {
    lockedWallet = await Wallet.loadWallet({ name: walletName });
  } catch (err) {
    lockedWallet = await Wallet.create({
      name: walletName,
      chain,
      network,
      baseUrl,
      password
    });
  }
  await lockedWallet.register({ baseUrl });

  if (addresses.length > 0) {
    const unlockedWallet = await lockedWallet.unlock(password);

    const keysToImport = addresses.map(a => ({ address: a }));
    await unlockedWallet.importKeys({ keys: keysToImport });
  }

  return lockedWallet;
}

async function bench(iteration = 0, startBlock = 0, endBlock = 100) {
  console.log('Benchmark', iteration, 'START');
  const addresses = await getAllAddressesFromBlocks(startBlock, endBlock);
  console.log('Collected', addresses.length, 'addresses');

  const walletCreationStart = new Date();
  const unlockedWallet = await createWallet(addresses, iteration);
  console.log(
    'Create a wallet with',
    addresses.length,
    'addresses. Took ',
    new Date().getTime() - walletCreationStart.getTime(),
    ' ms'
  );

  const walletTxListStart = new Date();
  const txStream = unlockedWallet.listTransactions({ startBlock, endBlock });
  let txcount = 0;
  let benchmarkComplete = new Promise(resolve => {
    txStream.on('data', () => {
      txcount++;
    });
    txStream.on('end', () => {
      console.log(
        'Listed ',
        txcount,
        ' txs for a wallet with',
        addresses.length,
        'addresses. Took ',
        new Date().getTime() - walletTxListStart.getTime(),
        ' ms'
      );
      resolve();
    });
  });
  await benchmarkComplete;
}

async function main() {
  for (let i = 1; i < 6; i++) {
    await bench(i, 0, Math.pow(10, i));
  }
  process.exit(0);
}
main();
