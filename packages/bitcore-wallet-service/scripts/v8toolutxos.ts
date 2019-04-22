#!/usr/bin/env node

const request = require('request');
const Bitcore = require('bitcore-lib');
import { Client } from '../src/lib//blockchainexplorers/v8/client';


const coin = 'BTC';
console.log('[v8tool.8:coin:]',coin); //TODO
const network = 'mainnet';
const authKey = process.argv[2]; 
const path = process.argv[3] || 'addresses'; 

if (!authKey) 
  throw "provide authKey"




// ====================
//
const authKeyObj =  Bitcore.PrivateKey(authKey);

let tmp  = authKeyObj.toObject();
tmp.compressed = false;
const pubKey = Bitcore.PrivateKey(tmp).toPublicKey() ;

//console.log(pubKey); 

const baseUrl = `https://api.bitcore.io/api/${coin}/${network}`;
let client = new Client({
  baseUrl: baseUrl,
  authKey: authKeyObj,
});

// utxos
// addresses

//const url = `${baseUrl}/wallet/${pubKey}/${path}`;
const url = `${baseUrl}/wallet/${pubKey}/${path}`;
console.log('[v8tool.37:url:]',url); //TODO
const signature = client.sign({ method: 'GET', url });
const payload = {};

request.get(url, {
  headers: { 'x-signature': signature },
  body: payload,
  json: true
}, (err, req, body) => {
  if (err) {
    console.log('[v8tool.43:err:]',err); //TODO
  } else {
    try {
console.log('[v8tool.50:body:]',body); //TODO
      //body.forEach((x)=> {
      //  console.log(x.address);
      //});
    } catch (e) {
console.log('[v8tool.52]', e, body); //TODO
    }
  }
});
