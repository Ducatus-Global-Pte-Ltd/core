import React, { Component } from 'react';
import { ParseApiStream, Wallet } from 'bitcore-client';
import { RouteComponentProps } from 'react-router';
import { WalletBar } from './BalanceCard';
import { TransactionListCard } from './TransactionContainer';
import { WalletBottomNav } from './BottomNav';
import { ActionCreators, store } from '../../index';
import { connect } from 'react-redux';
import { AppState } from '../../contexts/state';
import { socket } from '../../contexts/io';

interface Props extends RouteComponentProps<{ name: string }> {
  walletName: string;
  wallet?: Wallet;
  transactions: AppState['transactions'];
  addresses: AppState['addresses'];
}

class WalletContainer extends Component<Props> {
  componentDidUpdate = (prevProps: any) => {
    const { wallet } = this.props;
    if (wallet && prevProps.wallet !== wallet) {
      this.updateWalletInfo(wallet);
      this.fetchAddresses(wallet);
      this.handleGetTx(wallet);
      this.handleGetBlock(wallet);
    }
  };

  handleGetTx = (wallet: Wallet) => {
    socket.on('tx', () => {
      this.updateWalletInfo(wallet);
    });
  };

  handleGetBlock = (wallet: Wallet) => {
    socket.on('block', () => {
      this.updateWalletInfo(wallet);
    });
  };

  updateWalletInfo = (wallet: Wallet) => {
    this.fetchTransactions(wallet);
    this.updateBalance(wallet);
  };

  updateBalance = async (wallet: Wallet) => {
    const balance = await wallet.getBalance();
    store.dispatch(ActionCreators.setBalance(balance));
  };

  fetchTransactions = async (wallet: Wallet) => {
    await wallet
      .listTransactions({})
      .pipe(new ParseApiStream())
      .on('data', (d: any) => {
        let prevTx = this.props.transactions.map(e => e);
        const foundIndex = prevTx.findIndex(t => t.id === d.id);
        if (foundIndex > -1) {
          prevTx[foundIndex] = d;
        } else {
          // Recent 10 Transactions limit
          prevTx = [...prevTx.slice(0, 9), d];
        }
        store.dispatch(ActionCreators.setTransactions(prevTx));
      });
  };

  fetchAddresses = async (wallet: Wallet) => {
    await wallet
      .getAddresses()
      .pipe(new ParseApiStream())
      .on('data', (d: any) => {
        let addresses = [];
        if (Array.isArray(d)) {
          addresses = d;
        } else {
          addresses = [d];
        }
        addresses.map(a =>
          store.dispatch(ActionCreators.setAddress(a.address))
        );
      });
  };

  render() {
    return (
      <div>
        <WalletBar />
        <TransactionListCard />
        <WalletBottomNav value={1} />
      </div>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    wallet: state.wallet,
    addresses: state.addresses,
    transactions: state.transactions
  };
};

export const SingleWalletPage = connect(mapStateToProps)(WalletContainer);
