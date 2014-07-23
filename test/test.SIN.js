'use strict';

var chai = chai || require('chai');
var bitcore = bitcore || require('../bitcore');

var should = chai.should();

var SIN = bitcore.SIN;

describe('SIN', function() {
  it('should be able to create class', function() {
    should.exist(SIN);
  });
  it('should be able to create instance', function() {
    var s = new SIN();
    should.exist(s);
  });
  it('should be able to convert to string', function() {
    var s = new SIN('6bqov85Hsatqb8eLtwLW1PBQLWVNJkzPwgdAT3SYNkB6X2aF2n');
    s.toString.bind(s).should.not.throw();
  });
  var data = [
    ['6bqov85Hsatqb8eLtwLW1PBQLWVNJkzPwgdAT3SYNkB6X2aF2n', false],
    ['TfGPWmEYZCTr1FHqinjoGxnYAxdBhsta4qR', true],
    ['TexvSXam8vtoUviGajQyDuYdPSAEtwTNyZg', true]
  ];
  data.forEach(function(datum) {
    var sin = datum[0];
    var result = datum[1];
    it('should validate correctly ' + sin, function() {
      var a = new SIN(sin);
      var s = a.toString();
      a.isValid().should.equal(result);
      s.should.equal(a.toString()); // check that validation doesn't change data
    });
  });

  describe('#SIN', function() {
    it('should be able to create a new SIN with a version byte', function() {
      var myhash = bitcore.util.sha256ripe160('test123123');
      var sin = new SIN(SIN.SIN_EPHEM, myhash);
      should.exist(sin);
    });
  });
  describe('#fromPubKey', function() {
    it('should fail to create  a new SIN not using a pub key', function() {
      (function() { SIN.fromPubKey('1234')}).should.throw();
    });
    it('should fail to create  a new SIN not using a pub key case 2', function() {
      (function() { SIN.fromPubKey('X2345678901234567890123456789012112345678901234567890123456781011')}).should.throw();
    });
    it('should be able to create a new SIN using a pub key', function() {
      var pubkey1 = new Buffer('03e0973263b4e0d5f5f56d25d430e777ab3838ff644db972c0bf32c31da5686c27', 'hex');
      var sin = SIN.fromPubKey(pubkey1);
      should.exist(sin);
      sin.toString().should.equal('FrCfKjSFN1Ubp3x6AD6au8M5LTaNAEN8b');
    });
 
  });
});



