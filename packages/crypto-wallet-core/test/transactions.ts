import { expect } from 'chai';
import { Transactions } from '../src';

describe('Transaction Creation', () => {

  it.skip('should create a BTC tx', () => {
    // TODO
  });

  it.skip('should fail to get signatures on a BTC txs', () => {
    // TODO !!
  });

  it('should be able to create a livenet ETH tx', () => {
    const rawEthTx = {
      network: 'livenet',
      value: 3896000000000000,
      to: '0x37d7B3bBD88EFdE6a93cF74D2F5b0385D3E3B08A',
      data:
        '0xb6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000',
      gasPrice: 20000000000
    };
    const { value, to } = rawEthTx;
    const recipients = [{ address: to, amount: value }];
    const cryptoTx = Transactions.create({
      ...rawEthTx,
      chain: 'ETH',
      recipients,
      nonce: 0,
    });
    const expectedTx =
      '0xf9014f808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000018080';
    expect(cryptoTx).to.equal(expectedTx);
  });

  it('should be able to create a testnet ETH tx', () => {
    const rawEthTx = {
      network: 'testnet',
      value: 3896000000000000,
      to: '0x37d7B3bBD88EFdE6a93cF74D2F5b0385D3E3B08A',
      data:
        '0xb6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000',
      gasPrice: 20000000000
    };
    const { value, to } = rawEthTx;
    const recipients = [{ address: to, amount: value }];
    const cryptoTx = Transactions.create({
      ...rawEthTx,
      chain: 'ETH',
      recipients,
      nonce: 0,
    });
    const expectedTx =
      '0xf9014f808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead1468056300000000000000000000000000000000000000000000000000000000000000002a8080';
    expect(cryptoTx).to.equal(expectedTx);
  });

  it('should be able to create a kovan ETH tx', () => {
    const rawEthTx = {
      network: 'kovan',
      value: 3896000000000000,
      to: '0x37d7B3bBD88EFdE6a93cF74D2F5b0385D3E3B08A',
      data:
        '0xb6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000',
      gasPrice: 20000000000
    };
    const { value, to } = rawEthTx;
    const recipients = [{ address: to, amount: value }];
    const cryptoTx = Transactions.create({
      ...rawEthTx,
      chain: 'ETH',
      recipients,
      nonce: 0,
    });
    const expectedTx =
      '0xf9014f808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead1468056300000000000000000000000000000000000000000000000000000000000000002a8080';
    expect(cryptoTx).to.equal(expectedTx);
  });

  it('should be able to create a livenet ERC20 tx', () => {
    const rawEthTx = {
      network: 'livenet',
      value: 3896000000000000,
      to: '0x37d7B3bBD88EFdE6a93cF74D2F5b0385D3E3B08A',
      gasPrice: 20000000000,
      tokenAddress: '0x692a70d2e424a56d2c6c27aa97d1a86395877b3a'
    };
    const { value, to } = rawEthTx;
    const recipients = [{ address: to, amount: value }];
    const cryptoTx = Transactions.create({
      ...rawEthTx,
      chain: 'ERC20',
      recipients,
      nonce: 0,
    });
    const expectedTx =
      '0xf867808504a817c8008094692a70d2e424a56d2c6c27aa97d1a86395877b3a80b844a9059cbb00000000000000000000000037d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a000000000000000000000000000000000000000000000000000dd764300b8000018080';

    expect(cryptoTx).to.equal(expectedTx);
  });

  it('should be able to create a testnet ERC20 tx', () => {
    const rawEthTx = {
      network: 'testnet',
      value: 3896000000000000,
      to: '0x37d7B3bBD88EFdE6a93cF74D2F5b0385D3E3B08A',
      gasPrice: 20000000000,
      tokenAddress: '0x692a70d2e424a56d2c6c27aa97d1a86395877b3a'
    };
    const { value, to } = rawEthTx;
    const recipients = [{ address: to, amount: value }];
    const cryptoTx = Transactions.create({
      ...rawEthTx,
      chain: 'ERC20',
      recipients,
      nonce: 0,
    });
    const expectedTx =
      '0xf867808504a817c8008094692a70d2e424a56d2c6c27aa97d1a86395877b3a80b844a9059cbb00000000000000000000000037d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a000000000000000000000000000000000000000000000000000dd764300b80002a8080';

    expect(cryptoTx).to.equal(expectedTx);
  });

  it('should be able to create a kovan ERC20 tx', () => {
    const rawEthTx = {
      network: 'testnet',
      value: 3896000000000000,
      to: '0x37d7B3bBD88EFdE6a93cF74D2F5b0385D3E3B08A',
      gasPrice: 20000000000,
      tokenAddress: '0x692a70d2e424a56d2c6c27aa97d1a86395877b3a'
    };
    const { value, to } = rawEthTx;
    const recipients = [{ address: to, amount: value }];
    const cryptoTx = Transactions.create({
      ...rawEthTx,
      chain: 'ERC20',
      recipients,
      nonce: 0,
    });
    const expectedTx =
      '0xf867808504a817c8008094692a70d2e424a56d2c6c27aa97d1a86395877b3a80b844a9059cbb00000000000000000000000037d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a000000000000000000000000000000000000000000000000000dd764300b80002a8080';

    expect(cryptoTx).to.equal(expectedTx);
  });

  it('should be able to encode Data in ERC20 tx', () => {
    const recipients = [{ address: '0x37d7B3bBD88EFdE6a93cF74D2F5b0385D3E3B08A', amount: 3896000000000000 }];
    const tokenAddress = '0x692a70d2e424a56d2c6c27aa97d1a86395877b3a';
    const data = Transactions.get({chain: 'ERC20'}).encodeData({recipients, tokenAddress});
    const expectedData =
      '0xa9059cbb00000000000000000000000037d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a000000000000000000000000000000000000000000000000000dd764300b8000';

    expect(data).to.equal(expectedData);
  });

  it('should be only create a mainnet ETH tx with one recipient', () => {
    const rawEthTx = {
      network: 'mainnet',
      value: 3896000000000000,
      to: '0x37d7B3bBD88EFdE6a93cF74D2F5b0385D3E3B08A',
      data:
        '0xb6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000',
      gasPrice: 20000000000
    };
    const { value, to } = rawEthTx;
    const recipients = [{ address: to, amount: value }, { address: to, amount: value }];
    const cryptoTx = Transactions.create({
      ...rawEthTx,
      chain: 'ETH',
      recipients,
      nonce: 0,
    });
    const expectedTx =
      '0xf9014f808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000018080';
    expect(cryptoTx).to.equal(expectedTx);
  });
});

describe('Transaction Sign', () => {
  it('should be able to getSignature an ETH tx', () => {
    const signature = Transactions.getSignature({
      chain: 'ETH',
      tx: '0xf9014c808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000',
      key: { 
        privKey: '0x29a1271a8214ccf499b99070115adc43539d4e086b5babab57c4c7a88f959cc2'
      }
    });
    const expectedSignature = '0xdb427c4dddcfc816581d657d9f30f8287bdebd9b9cbabc7a535fc67cde9f2b3d2eafc2d79ef47fe045c47f08af54736caf797c27f2e25266d6320243104834f71b';
    expect(signature).to.equal(expectedSignature);
  });


  it('should apply signatures to an ETH tx', () => {
    const signedTx = Transactions.applySignature({
      chain: 'ETH',
      tx: '0xf9014c808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000',
    signature:  '0xdb427c4dddcfc816581d657d9f30f8287bdebd9b9cbabc7a535fc67cde9f2b3d2eafc2d79ef47fe045c47f08af54736caf797c27f2e25266d6320243104834f71b',
    });

    const expectedSignedTx =
      '0xf9018f808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead1468056300000000000000000000000000000000000000000000000000000000000000001ba0db427c4dddcfc816581d657d9f30f8287bdebd9b9cbabc7a535fc67cde9f2b3da02eafc2d79ef47fe045c47f08af54736caf797c27f2e25266d6320243104834f7';
    expect(signedTx).to.equal(expectedSignedTx);
  });


  it('should fail to apply signatures to an ETH tx if signature is invalid', () => {
    expect(() => { const signedTx = Transactions.applySignature({
      chain: 'ETH',
      tx: '0xf9014c808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000',
    signature:  '0xdb',
    })}).to.throw('invalid signature');
  });



  it('should sign an ETH tx', () => {
    const signedTx = Transactions.sign({
      chain: 'ETH',
      tx: '0xf9014c808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000',
      key: { 
        privKey: '0x29a1271a8214ccf499b99070115adc43539d4e086b5babab57c4c7a88f959cc2'
      }
    });
    const expectedSignedTx =
      '0xf9018f808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead1468056300000000000000000000000000000000000000000000000000000000000000001ba0db427c4dddcfc816581d657d9f30f8287bdebd9b9cbabc7a535fc67cde9f2b3da02eafc2d79ef47fe045c47f08af54736caf797c27f2e25266d6320243104834f7';
    expect(signedTx).to.equal(expectedSignedTx);
  });

  it('should get ETH tx hash', () => {
    const hash = Transactions.getHash({
      chain: 'ETH',
      tx: '0xf86c258502540be40083035b609482e041e84074fc5f5947d4d27e3c44f824b7a1a187b1a2bc2ec500008078a04a7db627266fa9a4116e3f6b33f5d245db40983234eb356261f36808909d2848a0166fa098a2ce3bda87af6000ed0083e3bf7cc31c6686b670bd85cbc6da2d6e85', // from https://ethereum.stackexchange.com/questions/31285/how-to-get-raw-ethereum-transaction-hash
    });
    const expectedHash =  '0x58e5a0fc7fbc849eddc100d44e86276168a8c7baaa5604e44ba6f5eb8ba1b7eb';
    expect(hash).to.equal(expectedHash);
  });

  it('should be throw using wrong privKey to sign an ETH tx', () => {
    let error
    try {
      Transactions.sign({
        chain: 'ETH',
        tx: '0xf9014c808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000',
        key: { 
          privKey: 'wrongPrivateKey'
        }
      });
    } catch (err) {
      error = err;
    }
    expect(error.message).to.include('invalid hexidecimal string');
    expect(error).to.not.equal(undefined);
  });
});

describe('ETH Transaction getChainId', () => {
  it('should get the correct chainId per network', () => {
    const mainnetId = Transactions.get({chain: 'ETH'}).getChainId('mainnet');
    expect(mainnetId).to.equal(1);

    const livenetId = Transactions.get({chain: 'ETH'}).getChainId('livenet');
    expect(livenetId).to.equal(1);

    const testId = Transactions.get({chain: 'ETH'}).getChainId('testnet');
    expect(testId).to.equal(42);

    const kovanId = Transactions.get({chain: 'ETH'}).getChainId('kovan');
    expect(kovanId).to.equal(42);

    const rinkebyId = Transactions.get({chain: 'ETH'}).getChainId('rinkeby');
    expect(rinkebyId).to.equal(4);

    const ropstenId = Transactions.get({chain: 'ETH'}).getChainId('ropsten');
    expect(ropstenId).to.equal(3);
  });
});
