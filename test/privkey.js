'use strict';

var should = require('chai').should();
var bitcore = require('..');
var BN = bitcore.crypto.BN;
var Point = bitcore.crypto.Point;
var Privkey = bitcore.Privkey;
var Pubkey = bitcore.Pubkey;

describe('Privkey', function() {
  var hex = '96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a';
  var buf = new Buffer(hex, 'hex');
  var enctestnet = 'cSdkPxkAjA4HDr5VHgsebAPDEh9Gyub4HK8UJr2DFGGqKKy4K5sG';
  var enctu = '92jJzK4tbURm1C7udQXxeCBvXHoHJstDXRxAMouPG1k1XUaXdsu';
  var encmainnet = 'L2Gkw3kKJ6N24QcDuH4XDqt9cTqsKTVNDGz1CRZhk9cq4auDUbJy';
  var encmu = '5JxgQaFM1FMd38cd14e3mbdxsdSa9iM2BV6DHBYsvGzxkTNQ7Un';

  it('should create an empty private key', function() {
    var privkey = new Privkey();
    should.exist(privkey);
  });

  it('should create a 0 private key with this convenience method', function() {
    var bn = BN(0);
    var privkey = new Privkey(bn);
    privkey.bn.toString().should.equal(bn.toString());
  });

  it('should create a mainnet private key', function() {
    var privkey = new Privkey({
      bn: BN.fromBuffer(buf),
      networkstr: 'mainnet',
      compressed: true
    });
    privkey.toString().should.equal(encmainnet);
  });

  it('should create an uncompressed testnet private key', function() {
    var privkey = new Privkey({
      bn: BN.fromBuffer(buf),
      networkstr: 'testnet',
      compressed: false
    });
    privkey.toString().should.equal(enctu);
  });

  it('should create an uncompressed mainnet private key', function() {
    var privkey = new Privkey({
      bn: BN.fromBuffer(buf),
      networkstr: 'mainnet',
      compressed: false
    });
    privkey.toString().should.equal(encmu);
  });

  describe('#set', function() {

    it('should set bn', function() {
      should.exist(Privkey().set({
        bn: BN.fromBuffer(buf)
      }).bn);
    });

  });

  describe('#fromJSON', function() {

    it('should input this address correctly', function() {
      var privkey = new Privkey();
      privkey.fromJSON(encmu);
      privkey.toWIF().should.equal(encmu);
    });

  });

  describe('#toString', function() {

    it('should output this address correctly', function() {
      var privkey = new Privkey();
      privkey.fromJSON(encmu);
      privkey.toJSON().should.equal(encmu);
    });

  });

  describe('#fromRandom', function() {

    it('should set bn gt 0 and lt n, and should be compressed', function() {
      var privkey = Privkey().fromRandom();
      privkey.bn.gt(BN(0)).should.equal(true);
      privkey.bn.lt(Point.getN()).should.equal(true);
      privkey.compressed.should.equal(true);
    });

  });

  describe('#fromWIF', function() {

    it('should parse this compressed testnet address correctly', function() {
      var privkey = new Privkey();
      privkey.fromWIF(encmainnet);
      privkey.toWIF().should.equal(encmainnet);
    });

  });

  describe('#toWIF', function() {

    it('should parse this compressed testnet address correctly', function() {
      var privkey = new Privkey();
      privkey.fromWIF(enctestnet);
      privkey.toWIF().should.equal(enctestnet);
    });

  });

  describe('#fromString', function() {

    it('should parse this uncompressed testnet address correctly', function() {
      var privkey = new Privkey();
      privkey.fromString(enctu);
      privkey.toWIF().should.equal(enctu);
    });

  });

  describe('#toString', function() {

    it('should parse this uncompressed mainnet address correctly', function() {
      var privkey = new Privkey();
      privkey.fromString(encmu);
      privkey.toString().should.equal(encmu);
    });

  });

  describe("#toPubkey", function() {

    it('should convert this known Privkey to known Pubkey', function() {
      var privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
      var pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc';
      var privkey = new Privkey({
        bn: BN(new Buffer(privhex, 'hex'))
      });
      var pubkey = privkey.toPubkey();
      pubkey.toString().should.equal(pubhex);
    });

    it('should convert this known Privkey to known Pubkey and preserve compressed=true', function() {
      var privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
      var privkey = new Privkey({
        bn: BN(new Buffer(privhex, 'hex'))
      });
      privkey.compressed = true;
      var pubkey = privkey.toPubkey();
      pubkey.compressed.should.equal(true);
    });

    it('should convert this known Privkey to known Pubkey and preserve compressed=true', function() {
      var privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff';
      var privkey = new Privkey({
        bn: BN(new Buffer(privhex, 'hex'))
      });
      privkey.compressed = false;
      var pubkey = privkey.toPubkey();
      pubkey.compressed.should.equal(false);
    });

  });

});
