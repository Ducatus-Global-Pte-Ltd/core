# bitcore-wallet-client

[![NPM Package](https://img.shields.io/npm/v/bitcore-wallet-client.svg?style=flat-square)](https://www.npmjs.org/package/bitcore-wallet-client)
[![Build Status](https://img.shields.io/travis/bitpay/bitcore-wallet-client.svg?branch=master&style=flat-square)](https://travis-ci.org/bitpay/bitcore-wallet-client) 
[![Coverage Status](https://coveralls.io/repos/bitpay/bitcore-wallet-client/badge.svg)](https://coveralls.io/r/bitpay/bitcore-wallet-client)

The *official* client library for [bitcore-wallet-service] (https://github.com/bitpay/bitcore-wallet-service). 

## Description

This package communicated to BWS [Bitcore wallet service](https://github.com/bitpay/bitcore-wallet-service) using its REST API. All REST endpoints are wrapped on simple async call. All relevant responses from BWS are checked independently by the peers, thus the importance of using this library with talking with a third party BWS instance.

See [Bitcore-wallet] (https://github.com/bitpay/bitcore-wallet) for a simple CLI wallet implementation that relays on BWS and uses bitcore-wallet-client.

## Get Started

To get going with bitcore-wallet-client you can use one of the following ways:

* via [Bower](http://bower.io/): by running `bower install bitcore-wallet-client` from your console
* or via [NPM](https://www.npmjs.com/package/bitcore-wallet-client): by running `npm install bitcore-wallet-client` from your console.

## Example

Start your own local [Bitcore wallet service](https://github.com/bitpay/bitcore-wallet-service) instance. In this example we suppose that you have `bitcore-wallet-service` running on your `localhost:3001`.

Then create two files `one.js` and `two.js` with the follow contents:

**one.js**

``` javascript
var Client = require('bitcore-wallet-client');
var fs = require('fs');
var BWS_INSTANCE_URL = 'http://localhost:3001/copay/api'

varthomas = new Client({
  baseUrl: BWS_INSTANCE_URL,
  verbose: false,
});

client.createWallet("My Wallet", "Irene", 2, 2, 'testnet', function(err, secret) {
  // Handle err
  console.log('Wallet Created. Share this secret with your copayers: ' + secret);
  fs.writeFileSync('irene.dat', client.export());
});
```

**two.js**

``` javascript
var Client = require('bitcore-wallet-client');
var fs = require('fs');
var BWS_INSTANCE_URL = 'http://localhost:3001/copay/api'
var secret = process.argv[2];

var client = new Client({
  baseUrl: BWS_INSTANCE_URL,
  verbose: false,
});

client.joinWallet(secret,  "Thomas", function(err, wallet) {
  // Handle err
  console.log('Wallet Joined!');
  fs.writeFileSync('thomas.dat', client.export());
});
```

Install `bitcore-wallet-client` before start:

```
npm i bitcore-wallet-client
```

Create a new wallet with the first script:

```
$ node one.js
info Generating new keys 
 Wallet Created. Share this secret with your copayers: JbTDjtUkvWS4c3mgAtJf4zKyRGzdQzZacfx2S7gRqPLcbeAWaSDEnazFJF6mKbzBvY1ZRwZCbvT
```

Join to this wallet with generated secret:

```
$ node two.js JbTDjtUkvWS4c3mgAtJf4zKyRGzdQzZacfx2S7gRqPLcbeAWaSDEnazFJF6mKbzBvY1ZRwZCbvT
Wallet Joined!
```

Note that the scripts created two files named `irene.dat` and `thomas.dat`. With these files you can get status, generate addresses, create proposals, sign transactions, etc.

## API Client

* [new API(opts)](#new_API)
* [API.seedFromExtendedPrivateKey(xPrivKey)](#API#seedFromExtendedPrivateKey)
* [API.seedFromRandom(xPrivKey)](#API#seedFromRandom)
* [ApI.export(opts)](#API#export)
* [ApI.import(opts)](#API#import)
* [ApI.toString()](#API#toString)
* [ApI.fromString(str)](#API#fromString)
* [API.isComplete()](#API#isComplete)
* [API.openWallet(cb)](#API#openWallet)
* [API.createWallet(walletName, copayerName, m, n, network, cb)](#API#createWallet)
* [API.joinWallet(secret, copayerName, cb)](#API#joinWallet)
* [API.getStatus(cb)](#API#getStatus)
* [API.sendTxProposal(opts)](#API#sendTxProposal)
* [API.createAddress(cb)](#API#createAddress)
* [API.getMainAddresses(opts, cb)](#API#getMainAddresses)
* [API.getBalance(cb)](#API#getBalance)
* [API.getTxProposals(opts)](#API#getTxProposals)
* [API.getSignatures(opts)](#API#getSignatures)
* [API.signTxProposal(txp, cb)](#API#signTxProposal)
* [API.rejectTxProposal(txp, reason, cb)](#API#rejectTxProposal)
* [API.broadcastTxProposal(txp, cb)](#API#broadcastTxProposal)
* [API.removeTxProposal(txp, cb)](#API#removeTxProposal)
* [API.getTxHistory(opts, cb)](#API#getTxHistory)

<a name="new_API"></a>
###new API(opts)
ClientAPI constructor.

**Params**

- opts `Object`  

<a name="API#seedFromExtendedPrivateKey"></a>
###API.seedFromExtendedPrivateKey(xPrivKey)
Seed from extended private key

**Params**

- xPrivKey `String`  

<a name="API#seedFromRandom"></a>
###API.seedFromRandom(xPrivKey)
Seed from random

**Params**

- network `String`  

<a name="API#export"></a>
###API.export(opts)
Export wallet

**Params**

- opts `Object`  
  - compressed `Boolean`  
  - password `String`  
  - noSign `Boolean`  

<a name="API#import"></a>
###API.import(opts)
Import wallet

**Params**

- opts `Object`  
  - compressed `Boolean`  
  - password `String`  

<a name="API#toString"></a>
###API.toString()
Return a serialized object with credentials

<a name="API#fromString"></a>
###API.fromString(str)
Get credentials from an object

**Params**

- str `Object`  

<a name="API#isComplete"></a>
###API.isComplete()
Return if wallet is complete

<a name="API#openWallet"></a>
###API.openWallet(cb)
Open a wallet and try to complete the public key ring.

**Params**

- cb `Callback`  

**Returns**: `Callback` - cb - Returns an error and a flag indicating that the wallet has just been completed and needs to be persisted  
<a name="API#createWallet"></a>
###API.createWallet(walletName, copayerName, m, n, network, cb)
Create a wallet.

**Params**

- walletName `String`  
- copayerName `String`  
- m `Number`  
- n `Number`  
- network `String` - 'livenet' or 'testnet'  
- cb `Callback`  

**Returns**: `Callback` - cb - Returns the wallet  
<a name="API#joinWallet"></a>
###API.joinWallet(secret, copayerName, cb)
Join to an existent wallet

**Params**

- secret `String`  
- copayerName `String`  
- cb `Callback`  

**Returns**: `Callback` - cb - Returns the wallet  
<a name="API#getStatus"></a>
###API.getStatus(cb)
Get status of the wallet

**Params**

- cb `Callback`  

**Returns**: `Callback` - cb - Returns error or an object with status information  
<a name="API#sendTxProposal"></a>
###API.sendTxProposal(opts)
Send a transaction proposal

**Params**

- opts `Object`  
  - toAddress `String`  
  - amount `Number`  
  - message `String`  

**Returns**: `Callback` - cb - Return error or the transaction proposal  
<a name="API#createAddress"></a>
###API.createAddress(cb)
Create a new address

**Params**

- cb `Callback`  

**Returns**: `Callback` - cb - Return error or the address  
<a name="API#getMainAddresses"></a>
###API.getMainAddresses(opts, cb)
Get your main addresses

**Params**

- opts `Object`  
  - doNotVerify `Boolean`  
- cb `Callback`  

**Returns**: `Callback` - cb - Return error or the array of addresses  
<a name="API#getBalance"></a>
###API.getBalance(cb)
Update wallet balance

**Params**

- cb `Callback`  

<a name="API#getTxProposals"></a>
##API.getTxProposals(opts)
Get list of transactions proposals

**Params**

- opts `Object`  
  - doNotVerify `Boolean`  
  - forAirGapped `Boolean`  

**Returns**: `Callback` - cb - Return error or array of transactions proposals  
<a name="API#getSignatures"></a>
###API.getSignatures(opts)
Get list of transactions proposals

**Params**

- opts `Object`  
  - doNotVerify `Boolean`  
  - forAirGapped `Boolean`  

**Returns**: `Callback` - cb - Return error or array of transactions proposals  
<a name="API#signTxProposal"></a>
###API.signTxProposal(txp, cb)
Sign a transaction proposal

**Params**

- txp `Object`  
- cb `Callback`  

**Returns**: `Callback` - cb - Return error or object  
<a name="API#rejectTxProposal"></a>
###API.rejectTxProposal(txp, reason, cb)
Reject a transaction proposal

**Params**

- txp `Object`  
- reason `String`  
- cb `Callback`  

**Returns**: `Callback` - cb - Return error or object  
<a name="API#broadcastTxProposal"></a>
###API.broadcastTxProposal(txp, cb)
Broadcast a transaction proposal

**Params**

- txp `Object`  
- cb `Callback`  

**Returns**: `Callback` - cb - Return error or object  
<a name="API#removeTxProposal"></a>
###API.removeTxProposal(txp, cb)
Remove a transaction proposal

**Params**

- txp `Object`  
- cb `Callback`  

**Returns**: `Callback` - cb - Return error or empty  
<a name="API#getTxHistory"></a>
###API.getTxHistory(opts, cb)
Get transaction history

**Params**

- opts `Object`  
- cb `Callback`  

**Returns**: `Callback` - cb - Return error or array of transactions

