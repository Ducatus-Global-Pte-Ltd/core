title: Insight Explorer
description: Provides an interface to fetch information about the state of the blockchain from a trusted Insight server.
---
# Insight

## Description

`bitcore.transport.explorers.Insight` is a simple agent to perform queries to the blockchain. There are currently two methods (the API will grow as features are requested): `getUnspentUtxos` and `broadcast`. The default servers are `https://insight.bitpay.com` and `https://test-insight.bitpay.com`, hosted by BitPay Inc.

### Retrieving Unspent UTXOs for an Address (or set of)

```javascript
var insight = new Insight();
insight.getUnspentUtxos('1Bitcoin...', function(err, utxos) {
  if (err) {
    // Handle errors...
  } else {
    // Maybe use the UTXOs to create a transaction
  }
});
```

### Broadcasting a Transaction

```javascript
var insight = new Insight();
insight.broadcast(tx, function(err, returnedTxId) {
  if (err) {
    // Handle errors...
  } else {
    // Mark the transaction as broadcasted
  }
});
```
