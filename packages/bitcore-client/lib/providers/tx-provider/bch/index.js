const bitcoreLib = require('bitcore-lib-cash');

export default class BCHTxProvder {
  create({addresses, amount, utxos, change}) {
    let tx = new bitcoreLib.Transaction()
      .from(utxos)
      .to(addresses, amounts)
      .change(change);
    return tx;
  }
}
