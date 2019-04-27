'use strict';

var _ = require('lodash');
var chai = chai || require('chai');
var sinon = sinon || require('sinon');
var should = chai.should();

var Constants = require('../lib/common/constants');
var Key = require('../lib/key');
var TestData = require('./testdata');

describe('Key', function() {

  describe('#create', function() {
    it('Should create', function() {
      var c = Key.create();
      should.exist(c.xPrivKey);
      should.exist(c.mnemonic);
    });

    it('Should create random keys', function() {
      var all = {};
      for (var i = 0; i < 10; i++) {
        var c = Key.create();
        var exist = all[c.xPrivKey];
        should.not.exist(exist);
        all[c.xPrivKey] = 1;
      }
    });


    it('Should create keys from mnemonic (no passphrase) ', function() {
      var all = {};
      var c = Key.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
      c.xPrivKey.should.equal('xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu');
    });


    it('Should create keys from mnemonic (with passphrase) ', function() {
      var all = {};
      var c = Key.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', 'pepe');
      c.xPrivKey.should.equal('xprv9s21ZrQH143K4C14pRZ5fTForcjAuRXLHs7Td28XuG2JMEC17Xm6JMGpNMRdNgfKZnyT3nmfeH8yVzxp6jnhmpVQAEmNBxLBh6t6t5UTVxo');
    });


    it('Should return priv key', function() {
      var all = {};
      var c = Key.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
      c.get().xPrivKey.should.be.equal('xprv9s21ZrQH143K3GJpoapnV8SFfukcVBSfeCficPSGfubmSFDxo1kuHnLisriDvSnRRuL2Qrg5ggqHKNVpxR86QEC8w35uxmGoggxtQTPvfUu');
    });


 
    it('Should return mnemonic', function() {
      var all = {};
      var c = Key.fromMnemonic('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
      c.get(null, true).mnemonic.should.be.equal('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    });
  });

  describe('Encryption', function() {
    describe('#encrypt', function() {
      it('should encrypt private key and remove cleartext', function() {
        var c = Key.create();
        c.encrypt('password');
        c.isPrivKeyEncrypted().should.be.true;
        should.exist(c.xPrivKeyEncrypted);
        should.exist(c.mnemonicEncrypted);
        should.not.exist(c.xPrivKey);
        should.not.exist(c.mnemonic);
      });
      it('should fail to encrypt private key if already encrypted', function() {
        var c = Key.create();
        c.encrypt('password');
        var err;
        try {
          c.encrypt('password');
        } catch (ex) {
          err = ex;
        }
        should.exist(err);
      });
    });
    describe('#decryptPrivateKey', function() {
      it('should decrypt private key', function() {
        var c = Key.create();
        c.encrypt('password');
        c.isPrivKeyEncrypted().should.be.true;
        c.decrypt('password');
        c.isPrivKeyEncrypted().should.be.false;
        should.exist(c.xPrivKey);
        should.exist(c.mnemonic);
        should.not.exist(c.xPrivKeyEncrypted);
        should.not.exist(c.mnemonicEncrypted);
      });
      it('should fail to decrypt private key with wrong password', function() {
        var c = Key.create();
        c.encrypt('password');

        var err;
        try {
          c.decrypt('wrong');
        } catch (ex) {
          ex.toString().should.match(/Could not decrypt/);
          err = ex;
        }
        should.exist(err);
        c.isPrivKeyEncrypted().should.be.true;
        should.exist(c.mnemonicEncrypted);
        should.not.exist(c.mnemonic);
      });
      it('should fail to decrypt private key when not encrypted', function() {
        var c = Key.create();

        var err;
        try {
          c.decrypt('password');
        } catch (ex) {
          ex.toString().should.match(/not encrypted/);
          err = ex;
        }
        should.exist(err);
        c.isPrivKeyEncrypted().should.be.false;
      });
    });
    describe('#getKeys', function() {
      it('should get keys regardless of encryption', function() {
        var c = Key.create();
        var keys = c.get(null, true);
        should.exist(keys.xPrivKey);
        should.exist(keys.mnemonic);
        keys.xPrivKey.should.equal(c.xPrivKey);
        keys.mnemonic.should.equal(c.mnemonic);

        c.encrypt('password');
        c.isPrivKeyEncrypted().should.be.true;
        var keys2 = c.get('password', true);
        should.exist(keys2);
        keys2.should.deep.equal(keys);

        c.decrypt('password');
        c.isPrivKeyEncrypted().should.be.false;
        var keys3 = c.get(null, true);
        should.exist(keys3);
        keys3.should.deep.equal(keys);
      });
      it('should get derived keys regardless of encryption', function() {
        var c = Key.create();
        var xPrivKey = c.derive(null, 'm/44');
        should.exist(xPrivKey);

        c.encrypt('password');
        c.isPrivKeyEncrypted().should.be.true;
        var xPrivKey2 = c.derive('password', 'm/44');
        should.exist(xPrivKey2);

        xPrivKey2.toString('hex').should.equal(xPrivKey.toString('hex'));

        c.decrypt('password');
        c.isPrivKeyEncrypted().should.be.false;
        var xPrivKey3 = c.derive(null, 'm/44');
        should.exist(xPrivKey3);
        xPrivKey3.toString('hex').should.equal(xPrivKey.toString('hex'));
      });
    });
  });


  describe('#fromExtendedPrivateKey', function() {
    it('Should create credentials from seed', function() {
      var xPriv = 'xprv9s21ZrQH143K2TjT3rF4m5AJcMvCetfQbVjFEx1Rped8qzcMJwbqxv21k3ftL69z7n3gqvvHthkdzbW14gxEFDYQdrRQMub3XdkJyt3GGGc';
      var k = Key.fromExtendedPrivateKey(xPriv);

      var c = k.createCredentials(null, {
        coin: 'btc',
        network: 'livenet',
        account: 0,
        n: 1,
      });
  

      c.xPrivKey.should.equal('xprv9s21ZrQH143K2TjT3rF4m5AJcMvCetfQbVjFEx1Rped8qzcMJwbqxv21k3ftL69z7n3gqvvHthkdzbW14gxEFDYQdrRQMub3XdkJyt3GGGc');
      c.xPubKey.should.equal('xpub6DUean44k773kxbUq8QpSmAPFaNCpk5AzrxbFRAMsNCZBGD15XQVnRJCgNd8GtJVmDyDZh89NPZz1XPQeX5w6bAdLGfSTUuPDEQwBgKxfh1');
      c.copayerId.should.equal('bad66ef88ad8dec08e36d576c29b4f091d30197f04e166871e64bf969d08a958');
      c.network.should.equal('livenet');
      c.personalEncryptingKey.should.equal('M4MTmfRZaTtX6izAAxTpJg==');
      should.not.exist(c.walletPrivKey);
    });

    it('Should create credentials from seed and walletPrivateKey', function() {
      var xPriv = 'xprv9s21ZrQH143K2TjT3rF4m5AJcMvCetfQbVjFEx1Rped8qzcMJwbqxv21k3ftL69z7n3gqvvHthkdzbW14gxEFDYQdrRQMub3XdkJyt3GGGc';

      var wKey = 'a28840e18650b1de8cb83bcd2213672a728be38a63e70680b0c2be9c452e2d4d';
      var c = Credentials.fromExtendedPrivateKey('btc', xPriv, 0, 'BIP44', { walletPrivKey: 'a28840e18650b1de8cb83bcd2213672a728be38a63e70680b0c2be9c452e2d4d'});

      c.xPrivKey.should.equal('xprv9s21ZrQH143K2TjT3rF4m5AJcMvCetfQbVjFEx1Rped8qzcMJwbqxv21k3ftL69z7n3gqvvHthkdzbW14gxEFDYQdrRQMub3XdkJyt3GGGc');
      c.walletPrivKey.should.equal(wKey);
    });

    describe('Compliant derivation', function() {
      it('Should create compliant base address derivation key', function() {
        var xPriv = 'xprv9s21ZrQH143K4HHBKb6APEoa5i58fxeFWP1x5AGMfr6zXB3A6Hjt7f9LrPXp9P7CiTCA3Hk66cS4g8enUHWpYHpNhtufxSrSpcbaQyVX163';
        var c = Credentials.fromExtendedPrivateKey('btc', xPriv, 0, 'BIP44');
        c.xPubKey.should.equal('xpub6CUtFEwZKBEyX6xF4ECdJdfRBBo69ufVgmRpy7oqzWJBSadSZ3vaqvCPNFsarga4UWcgTuoDQL7ZnpgWkUVUAX3oc7ej8qfLEuhMALGvFwX');
      });

      it('Should create compliant request key', function() {
        var xPriv = 'xprv9s21ZrQH143K3xMCR1BNaUrTuh1XJnsj8KjEL5VpQty3NY8ufgbR8SjZS8B4offHq6Jj5WhgFpM2dcYxeqLLCuj1wgMnSfmZuPUtGk8rWT7';
        var c = Credentials.fromExtendedPrivateKey('btc', xPriv, 0, 'BIP44');
        c.requestPrivKey.should.equal('559371263eb0b2fd9cd2aa773ca5fea69ed1f9d9bdb8a094db321f02e9d53cec');
      });

      it('should accept non-compliant derivation as a parameter when importing', function() {
        var c = Credentials.fromExtendedPrivateKey('btc', 'tprv8ZgxMBicQKsPd8U9aBBJ5J2v8XMwKwZvf8qcu2gLK5FRrsrPeSgkEcNHqKx4zwv6cP536m68q2UD7wVM24zdSCpaJRmpowaeJTeVMXL5v5k', 0, 'BIP44', {
          nonCompliantDerivation: true
        });
        c.xPrivKey.should.equal('tprv8ZgxMBicQKsPd8U9aBBJ5J2v8XMwKwZvf8qcu2gLK5FRrsrPeSgkEcNHqKx4zwv6cP536m68q2UD7wVM24zdSCpaJRmpowaeJTeVMXL5v5k');
        c.compliantDerivation.should.be.false;
        c.xPubKey.should.equal('tpubDD919WKKqmh2CqKnSsfUAJWB9bnLbcry6r61tBuY8YEaTBBpvXSpwdXXBGAB1n4JRFDC7ebo7if3psUAMpvQJUBe3LcjuMNA6Y4nP8U9SNg');
        c.getDerivedXPrivKey().toString().should.equal("tprv8gSy16H5hQ1MKNHzZDzsktr4aaGQSHg4XYVEbfsEiGSBcgw4J8dEm8uf19FH4L9h6W47VBKtc3bbYyjb6HAm6QdyRLpB6fsA7bW19RZnby2");
      });
    });
  });

  describe('#derive', function() {
    it('should derive extended private key from master livenet', function() {
      var c = Key.fromExtendedPrivateKey('xprv9s21ZrQH143K3zLpjtB4J4yrRfDTEfbrMa9vLZaTAv5BzASwBmA16mdBmZKpMLssw1AzTnm31HAD2pk2bsnZ9dccxaLD48mRdhtw82XoiBi');
      var xpk = c.derive(null, 'm/44\'/0\'/0\'').toString();
      xpk.should.equal('xprv9xud2WztGSSBPDPDL9RQ3rG3vucRA4BmEnfAdP76bTqtkGCK8VzWjevLw9LsdqwH1PEWiwcjymf1T2FLp12XjwjuCRvcSBJvxDgv1BDTbWY');
    });
    it('should derive extended private key from master BIP48 livenet', function() {
      var c = Key.fromExtendedPrivateKey('xprv9s21ZrQH143K3zLpjtB4J4yrRfDTEfbrMa9vLZaTAv5BzASwBmA16mdBmZKpMLssw1AzTnm31HAD2pk2bsnZ9dccxaLD48mRdhtw82XoiBi');
      var xpk = c.derive(null, 'm/48\'/0\'/0\'').toString();
      xpk.should.equal('xprv9yaGCLKPS2ovEGw987MZr4DCkfZHGh518ndVk3Jb6eiUdPwCQu7nYru59WoNkTEQvmhnv5sPbYxeuee5k8QASWRnGV2iFX4RmKXEQse8KnQ');
    });
    it('should derive compliant child', function() {
      var c = Key.fromExtendedPrivateKey('tprv8ZgxMBicQKsPd8U9aBBJ5J2v8XMwKwZvf8qcu2gLK5FRrsrPeSgkEcNHqKx4zwv6cP536m68q2UD7wVM24zdSCpaJRmpowaeJTeVMXL5v5k');
      c.compliantDerivation.should.be.true;
      var xpk = c.derive(null, 'm/44\'/1\'/0\'').toString();
      xpk.should.equal('tprv8gXvQvjGt7oYCTRD3d4oeQr9B7JLuC2B6S854F4XWCQ4pr9NcjokH9kouWMAp1MJKy4Y8QLBgbmPtk3i7RegVzaWhWsnVPi4ZmykJXt4HeV');
    });
    it('should derive non-compliant child', function() {
      var c = Key.fromExtendedPrivateKey('tprv8ZgxMBicQKsPd8U9aBBJ5J2v8XMwKwZvf8qcu2gLK5FRrsrPeSgkEcNHqKx4zwv6cP536m68q2UD7wVM24zdSCpaJRmpowaeJTeVMXL5v5k', {nonCompliantDerivation: true});
      c.compliantDerivation.should.be.false;
      var xpk = c.derive(null, 'm/44\'/1\'/0\'').toString();
      xpk.should.equal('tprv8gSy16H5hQ1MKNHzZDzsktr4aaGQSHg4XYVEbfsEiGSBcgw4J8dEm8uf19FH4L9h6W47VBKtc3bbYyjb6HAm6QdyRLpB6fsA7bW19RZnby2');
    });
  });


  describe('#createCredentials', function() {
    it('should create 1-1 credentials', function() {
      var c = Key.fromExtendedPrivateKey('xprv9s21ZrQH143K3zLpjtB4J4yrRfDTEfbrMa9vLZaTAv5BzASwBmA16mdBmZKpMLssw1AzTnm31HAD2pk2bsnZ9dccxaLD48mRdhtw82XoiBi');
      var cred = c.createCredentials(null, {
        coin: 'btc',
        network: 'testnet',
        account: 0,
        n: 1,
      });
      cred.addressType.should.equal('P2PKH');
      cred.rootPath.should.equal('m/44\'/1\'/0\'');
      cred.compliantDerivation.should.equal(true);
    });

    it('should create 2-2 credentials', function() {
      var c = Key.fromExtendedPrivateKey('xprv9s21ZrQH143K3zLpjtB4J4yrRfDTEfbrMa9vLZaTAv5BzASwBmA16mdBmZKpMLssw1AzTnm31HAD2pk2bsnZ9dccxaLD48mRdhtw82XoiBi');
      var cred = c.createCredentials(null, {
        coin: 'bch',
        network: 'livenet',
        account: 1,
        n: 2,
        nonCompliantDerivation: true,
      });
      cred.account.should.equal(1);
      cred.addressType.should.equal('P2SH');
      cred.n.should.equal(2);
      cred.rootPath.should.equal('m/48\'/145\'/1\'');
      cred.compliantDerivation.should.equal(true);
    });
  });

  describe('#getBaseAddressDerivationPath', function() {
    it('should return path for livenet', function() {
      var c = Key.fromExtendedPrivateKey('xprv9s21ZrQH143K3zLpjtB4J4yrRfDTEfbrMa9vLZaTAv5BzASwBmA16mdBmZKpMLssw1AzTnm31HAD2pk2bsnZ9dccxaLD48mRdhtw82XoiBi');
      var path = c.getBaseAddressDerivationPath({
        account: 0,
        coin: 'btc',
        n: 0,
      });
      path.should.equal("m/44'/0'/0'");
    });
    it('should return path for testnet account 2', function() {
      var c = Key.fromExtendedPrivateKey('xprv9s21ZrQH143K3zLpjtB4J4yrRfDTEfbrMa9vLZaTAv5BzASwBmA16mdBmZKpMLssw1AzTnm31HAD2pk2bsnZ9dccxaLD48mRdhtw82XoiBi');
      var path = c.getBaseAddressDerivationPath({
        account: 2,
        coin: 'btc',
        network: 'testnet',
        n: 1,
      });
      path.should.equal("m/44'/1'/2'");
    });
    it.skip('should return path for BIP45', function() {
      var c = Credentials.create('btc', 'livenet');
      c.derivationStrategy = Constants.DERIVATION_STRATEGIES.BIP45;
      var path = c.getBaseAddressDerivationPath();

      path.should.equal("m/45'");
    });

    it('should return path for testnet account 1', function() {
      var c = Key.fromExtendedPrivateKey('xprv9s21ZrQH143K3zLpjtB4J4yrRfDTEfbrMa9vLZaTAv5BzASwBmA16mdBmZKpMLssw1AzTnm31HAD2pk2bsnZ9dccxaLD48mRdhtw82XoiBi');
      var path = c.getBaseAddressDerivationPath({
        account: 1,
        coin: 'btc',
        network: 'testnet',
        n: 1,
      });
      path.should.equal("m/44'/1'/1'");
    });

  });

  describe('#createCredentials', function() {
    it('should return different copayerId for different coin / accounts', function() {
      var k = Key.fromExtendedPrivateKey('xprv9s21ZrQH143K3zLpjtB4J4yrRfDTEfbrMa9vLZaTAv5BzASwBmA16mdBmZKpMLssw1AzTnm31HAD2pk2bsnZ9dccxaLD48mRdhtw82XoiBi');

      let c = k.createCredentials(null, {
        coin: 'btc',
        account: 0,
        network: 'livenet',
        n: 1,
      });
      let c1 = k.createCredentials(null, {
        coin: 'btc',
        account: 1,
        network: 'livenet',
        n: 1, });
      let c2 = k.createCredentials(null, {
        coin: 'bch',
        account: 1,
        network: 'livenet',
        n: 1,
      });
      c.copayerId.should.equal('4abffe3e0e52a4cec11ebf966675cb526566919a8a0d5de36d9b2898ee804a58');
      c1.copayerId.should.equal('911867838cffffc2bbd05e519f1932d56c49b93a908136ce7a17b70573c1c428');
      c2.copayerId.should.equal('dc9577aa5054563f31047463e25ec52f96c5b1fa93c4b567f2329eb6a66517d0');
    });

    it('should return different copayerId for different network', function() {

      var words = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      var k = Key.fromMnemonic(words);
      var c =  k.createCredentials(null, {
        coin: 'btc',
        account: 0,
        network: 'livenet',
        n: 1,
      });
      c.copayerId.should.equal('af4e120530f26ffa834739b0eb030093c881bf73f8f893fc6837823325da83f2');

      var c2 = k.createCredentials(null, {
        coin: 'btc',
        account: 0,
        network: 'testnet',
        n: 1,
      });

      c2.copayerId.should.equal('51d883fcd4ec010a89503c4b64e0cf22fe706495a9cf086bec69194c1c8f8952');
    });
  });
});


