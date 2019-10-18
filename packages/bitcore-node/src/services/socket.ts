import logger from '../logger';
import SocketIO = require('socket.io');
import * as http from 'http';
import { LoggifyClass } from '../decorators/Loggify';
import { EventStorage, EventModel, IEvent } from '../models/events';
import { Event, EventService } from './event';
import { ObjectID } from 'mongodb';
import { Config, ConfigService } from './config';
import { ConfigType } from '../types/Config';
import { VerificationPayload, verifyRequestSignature } from '../routes/api/wallet';
import { WalletStorage } from '../models/wallet';

function SanitizeWallet(x: { wallets?: ObjectID[] }) {
  const sanitized = Object.assign({}, x, { wallets: new Array<ObjectID>() });
  if (sanitized.wallets && sanitized.wallets.length > 0) {
    delete sanitized.wallets;
  }
  return sanitized;
}

@LoggifyClass
export class SocketService {
  httpServer?: http.Server;
  io?: SocketIO.Server;
  id: number = Math.random();
  configService: ConfigService;
  serviceConfig: ConfigType['services']['socket'];
  eventService: EventService;
  eventModel: EventModel;
  stopped = true;

  constructor({ eventService = Event, eventModel = EventStorage, configService = Config } = {}) {
    this.eventService = eventService;
    this.configService = configService;
    this.serviceConfig = this.configService.for('socket');
    this.eventModel = eventModel;
    this.wireup = this.wireup.bind(this);
    this.start = this.start.bind(this);
    this.signalTx = this.signalTx.bind(this);
    this.signalBlock = this.signalBlock.bind(this);
    this.signalAddressCoin = this.signalAddressCoin.bind(this);
  }

  validateRequest(payload: VerificationPayload) {
    try {
      const valid = verifyRequestSignature(payload);
      return valid;
    } catch (e) {
      return false;
    }
  }

  start({ server }: { server: http.Server }) {
    const bwsKeys = this.configService.for('socket').bwsKeys;
    if (this.configService.isDisabled('socket')) {
      logger.info('Disabled Socket Service');
      return;
    }
    if (this.stopped) {
      this.stopped = false;
      logger.info('Starting Socket Service');
      this.httpServer = server;
      this.io = SocketIO(server);
      this.io.sockets.on('connection', socket => {
        socket.on('room', (room: string, payload: VerificationPayload) => {
          const roomName = room.slice(room.lastIndexOf('/') + 1);
          switch (roomName) {
            case 'wallets':
              if (bwsKeys.includes(payload.pubKey) && this.validateRequest(payload)) {
                socket.join(room);
              }
              break;
            case 'wallet':
              if (this.validateRequest(payload)) {
                socket.join(room);
              }
              break;
            case 'inv':
            case 'address':
              socket.join(room);
              break;
          }
        });
      });
    }
    this.wireup();
  }

  stop() {
    logger.info('Stopping Socket Service');
    this.stopped = true;
    return new Promise(resolve => {
      if (this.io) {
        this.io.close(resolve);
      } else {
        resolve();
      }
    });
  }

  async wireup() {
    this.eventService.txEvent.on('tx', async (tx: IEvent.TxEvent) => {
      if (this.io) {
        const { chain, network } = tx;
        const sanitizedTx = SanitizeWallet(tx);
        this.io.sockets.in(`/${chain}/${network}/inv`).emit('tx', sanitizedTx);

        if (tx.wallets && tx.wallets.length) {
          const wallets = await WalletStorage.collection.find({ _id: { $in: tx.wallets } }).toArray();
          for (let wallet of wallets) {
            this.io.sockets.in(`/${chain}/${network}/wallets`).emit('tx', tx);
            this.io.sockets.in(`/${chain}/${network}/wallet`).emit('tx', { pubKey: wallet.pubKey, tx: sanitizedTx });
          }
        }
      }
    });

    this.eventService.blockEvent.on('block', (block: IEvent.BlockEvent) => {
      if (this.io) {
        const { chain, network } = block;
        this.io.sockets.in(`/${chain}/${network}/inv`).emit('block', block);
      }
    });

    this.eventService.addressCoinEvent.on('coin', async (addressCoin: IEvent.CoinEvent) => {
      if (this.io) {
        const { coin, address } = addressCoin;
        const { chain, network } = coin;
        const sanitizedCoin = SanitizeWallet(coin);
        this.io.sockets.in(`/${chain}/${network}/address`).emit(address, sanitizedCoin);
        this.io.sockets.in(`/${chain}/${network}/inv`).emit('coin', sanitizedCoin);
        if (coin.wallets && coin.wallets.length) {
          const wallets = await WalletStorage.collection.find({ _id: { $in: coin.wallets } }).toArray();
          for (let wallet of wallets) {
            this.io.sockets.in(`/${chain}/${network}/wallets`).emit('coin', coin);
            this.io.sockets
              .in(`/${chain}/${network}/wallet`)
              .emit('coin', { pubKey: wallet.pubKey, coin: sanitizedCoin });
          }
        }
      }
    });
  }

  async signalBlock(block: IEvent.BlockEvent) {
    await EventStorage.signalBlock(block);
  }

  async signalTx(tx: IEvent.TxEvent) {
    await EventStorage.signalTx(tx);
  }

  async signalAddressCoin(payload: IEvent.CoinEvent) {
    await EventStorage.signalAddressCoin(payload);
  }
}

export const Socket = new SocketService();
