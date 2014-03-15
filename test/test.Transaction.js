'use strict';

var chai = chai || require('chai');
var bitcore = bitcore || require('../bitcore');

var should = chai.should();

var TransactionModule = bitcore.Transaction;
var Transaction;
var In;
var Out;
var Script = bitcore.Script;
var util = bitcore.util;
var buffertools = require('buffertools');
var testdata = testdata || require('./testdata');

describe('Transaction', function() {
  it('should initialze the main object', function() {
    should.exist(TransactionModule);
  });
  it('should be able to create class', function() {
    Transaction = TransactionModule;
    should.exist(Transaction);
    In = Transaction.In;
    Out = Transaction.Out;
    should.exist(In);
    should.exist(Out);
  });


  it('should be able to create instance', function() {
    var t = new Transaction();
    should.exist(t);
  });


  it('should be able to select utxos', function() {
    var u = Transaction.selectUnspent(testdata.dataUnspends,1.0);
    u.length.should.equal(3);
    u = Transaction.selectUnspent(testdata.dataUnspends,0.5);
    u.length.should.equal(3);
    u = Transaction.selectUnspent(testdata.dataUnspends,0.1);
    u.length.should.equal(2);
    u = Transaction.selectUnspent(testdata.dataUnspends,0.05);
    u.length.should.equal(2);
    u = Transaction.selectUnspent(testdata.dataUnspends,0.015);
    u.length.should.equal(2);
    u = Transaction.selectUnspent(testdata.dataUnspends,0.01);
    u.length.should.equal(1);
    should.exist(u[0].amount);
    should.exist(u[0].txid);
    should.exist(u[0].scriptPubKey);
    should.exist(u[0].vout);
  });

  it('should return null if not enough utxos', function() {
    var u = Transaction.selectUnspent(testdata.dataUnspends,1.12);
    u.length.should.equal(0);
  });


  it('should be able to create instance thru #create', function() {
    var utxos = Transaction.selectUnspent(testdata.dataUnspends,0.1);
    var outs = [{address:'mrPnbY1yKDBsdgbHbS7kJ8GVm8F66hWHLE', amount:0.08}];
    var tx = Transaction.create(utxos, outs, 
                                {remainderAddress:'3CMNFxN1oHBc4R1EpboAL5yzHGgE611Xou'});
    should.exist(tx);
    tx.version.should.equal(1);
    tx.ins.length.should.equal(2);
    tx.outs.length.should.equal(2);
    util.valueToBigInt(tx.outs[0].v).cmp(8000000).should.equal(0);
    // TODO remainder is 0.03 here because unspend just select utxos in order
    util.valueToBigInt(tx.outs[1].v).cmp(3000000).should.equal(0);
  });

  // Read tests from test/data/tx_valid.json
  // Format is an array of arrays
  // Inner arrays are either [ "comment" ]
  // or [[[prevout hash, prevout index, prevout scriptPubKey], [input 2], ...],"], serializedTransaction, enforceP2SH
  // ... where all scripts are stringified scripts.
  testdata.dataTxValid.forEach(function(datum) {
    if (datum.length === 3) {
      it.skip('valid tx=' + datum[1], function(done) {
        var inputs = datum[0];
        var map = {};
        inputs.forEach(function(vin) {
          var hash = vin[0];
          var index = vin[1];
          var scriptPubKey = new Script(new Buffer(vin[2]));
          map[[hash, index]] = scriptPubKey; //Script.fromStringContent(scriptPubKey);
          console.log(scriptPubKey.getStringContent());
          console.log('********************************');
          done();

        });
        var raw = new Buffer(datum[1], 'hex');
        var tx = new Transaction();
        tx.parse(raw);

        buffertools.toHex(tx.serialize()).should.equal(buffertools.toHex(raw));

        var i = 0;
        var stx = tx.getStandardizedObject();
        tx.ins.forEach(function(txin) {
          var scriptPubKey = map[[stx. in [i].prev_out.hash, stx. in [i].prev_out.n]];
          i += 1;
        });
      });
    }
  });
});
