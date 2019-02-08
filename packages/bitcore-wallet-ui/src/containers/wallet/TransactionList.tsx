import React from 'react';
import { Wallet } from 'bitcore-client';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import RefreshIcon from '@material-ui/icons/Refresh';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

interface Props {
  tx: any;
  classes: any;
  wallet?: Wallet;
  API_URL: string;
}

const styles = (theme: any) => ({
  paper: {
    maxWidth: 600,
    padding: theme.spacing.unit * 2,
    alignItems: 'center',
    borderTop: '2px solid #002855'
  } as any,
  greenpaper: {
    maxWidth: 600,
    padding: theme.spacing.unit * 2,
    alignItems: 'center',
    borderTop: '2px solid green'
  },
  textRight: {
    textAlign: 'right'
  } as any,
  avatar: {
    backgroundColor: 'white',
    color: 'green',
    border: '1px solid green',
    margin: 'auto'
  },
  defaultAvatar: {
    backgroundColor: 'white',
    color: '#002855',
    border: '1px solid #002855',
    margin: 'auto'
  },
  auto: {
    margin: 'auto'
  } as any,
  default: {
    color: '#002855'
  },
  green: {
    color: 'green'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none'
    }
  }
});

function Transactions(props: Props) {
  const { classes, tx, wallet, API_URL } = props;
  return (
    <a
      href={
        wallet
          ? `http://localhost:8200/#/home/${wallet.chain}/${
              wallet.network
            }/tx/${tx.txid}`
          : ''
      }
    >
      <Paper className={tx.height > 0 ? classes.greenpaper : classes.paper}>
        <Grid container wrap="nowrap" spacing={16}>
          <Grid item className={classes.auto}>
            <Avatar
              className={tx.height > 0 ? classes.avatar : classes.defaultAvatar}
            >
              {tx.height > 0 ? <ArrowUpwardIcon /> : <RefreshIcon />}
            </Avatar>
          </Grid>
          <Grid item xs zeroMinWidth className={classes.auto}>
            <Typography
              noWrap
              variant="h6"
              className={tx.height > 0 ? classes.green : classes.default}
            >
              {tx.height > 0 ? `Block: ${tx.height}` : 'Confirming'}{' '}
            </Typography>
          </Grid>
          <Grid item className={classes.textRight}>
            <Typography
              variant="subtitle1"
              className={tx.height > 0 ? classes.green : classes.default}
            >
              {tx.value / 1e8 || tx.satoshis / 1e8} {wallet ? wallet.chain : ''}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {new Date(tx.blockTime).toDateString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </a>
  );
}

export const TransactionList = withStyles(styles)(Transactions);
