import { DucatuscoreLib } from 'crypto-wallet-core';
import _ from 'lodash';
import { IChain } from '..';
import { BtcChain } from '../btc';

const Common = require('../../common');
const Defaults = Common.Defaults;
const Errors = require('../../errors/errordefinitions');

export class DucChain extends BtcChain implements IChain {
  constructor() {
    super(DucatuscoreLib);
  }
}
