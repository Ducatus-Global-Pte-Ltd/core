import { expect } from 'chai';
import { Transactions } from '../src';

describe('Transaction Creation', () => {

  it.skip('should create a BTC tx', () => {
    // TODO
  });

  it.skip('should fail to get signatures on a BTC txs', () => {
    // TODO !!
  });


  it('should be able to create an ETH tx', () => {
    const rawEthTx = {
      value: 3896000000000000,
      to: '0x37d7B3bBD88EFdE6a93cF74D2F5b0385D3E3B08A',
      data:
        '0xb6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000',
      gasPrice: 20000000000
    };
    const { value, to, data, gasPrice } = rawEthTx;
    const recipients = [{ address: to, amount: value }];
    const cryptoTx = Transactions.create({
      chain: 'ETH',
      recipients,
      gasPrice,
      nonce: 0,
      data
    });
    const expectedTx =
      '0xf9014f808504a817c800809437d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a870dd764300b8000b90124b6b4af05000000000000000000000000000000000000000000000000000dd764300b800000000000000000000000000000000000000000000000000000000004a817c8000000000000000000000000000000000000000000000000000000016ada606a26050bb49a5a8228599e0dd48c1368abd36f4f14d2b74a015b2d168dbcab0773ce399393220df874bb22ca961f351e038acd2ba5cc8c764385c9f23707622cc435000000000000000000000000000000000000000000000000000000000000001c7e247d684a635813267b10a63f7f3ba88b28ca2790c909110b28236cf1b9bba03451e83d5834189f28d4c77802fc76b7c760a42bc8bebf8dd15e6ead146805630000000000000000000000000000000000000000000000000000000000000000018080';
    expect(cryptoTx).to.equal(expectedTx);
  });

  it('should be able to create an ERC20 tx', () => {
    const rawEthTx = {
      value: 3896000000000000,
      to: '0x37d7B3bBD88EFdE6a93cF74D2F5b0385D3E3B08A',
      gasPrice: 20000000000
    };
    const { value, to, gasPrice } = rawEthTx;
    const recipients = [{ address: to, amount: value }];
    const cryptoTx = Transactions.create({
      chain: 'ERC20',
      recipients,
      gasPrice,
      nonce: 0,
      tokenAddress: '0x692a70d2e424a56d2c6c27aa97d1a86395877b3a'
    });
    const expectedTx =
      '0xf867808504a817c8008094692a70d2e424a56d2c6c27aa97d1a86395877b3a80b844a9059cbb00000000000000000000000037d7b3bbd88efde6a93cf74d2f5b0385d3e3b08a000000000000000000000000000000000000000000000000000dd764300b8000018080';

    expect(cryptoTx).to.equal(expectedTx);
  });

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
