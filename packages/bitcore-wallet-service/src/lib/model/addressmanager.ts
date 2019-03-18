var _ = require('lodash');
var $ = require('preconditions').singleton();

var Constants = require('../common/constants');
var Utils = require('../common/utils');

export class AddressManager {
  version: number;
  derivationStrategy: string;
  receiveAddressIndex: number;
  changeAddressIndex: number;
  copayerIndex: number;
  skippedPaths: Array<{ path: string; isChange: boolean }>;

  static fromObj(obj) {
    var x = new AddressManager();

    x.version = obj.version;
    x.derivationStrategy =
      obj.derivationStrategy || Constants.DERIVATION_STRATEGIES.BIP45;
    x.receiveAddressIndex = obj.receiveAddressIndex;
    x.changeAddressIndex = obj.changeAddressIndex;
    x.copayerIndex = obj.copayerIndex;

    // this is not stored, only temporary.
    x.skippedPaths = [];

    return x;
  }

  static supportsCopayerBranches(derivationStrategy) {
    return derivationStrategy == Constants.DERIVATION_STRATEGIES.BIP45;
  }

  _incrementIndex(isChange) {
    if (isChange) {
      this.changeAddressIndex++;
    } else {
      this.receiveAddressIndex++;
    }
  }

  rewindIndex(isChange, step, n) {
    step = _.isUndefined(step) ? 1 : step;
    n = _.isUndefined(n) ? 1 : n;

    if (isChange) {
      this.changeAddressIndex = Math.max(0, this.changeAddressIndex - n * step);
    } else {
      this.receiveAddressIndex = Math.max(
        0,
        this.receiveAddressIndex - n * step
      );
    }

    //clear skipppedPath, since index is rewinded
    // n address were actually derived.
    this.skippedPaths = this.skippedPaths.splice(
      0,
      this.skippedPaths.length - step * n + n
    );
  }

  getCurrentIndex(isChange) {
    return isChange ? this.changeAddressIndex : this.receiveAddressIndex;
  }

  getBaseAddressPath(isChange) {
    return (
      'm/' +
      (this.derivationStrategy == Constants.DERIVATION_STRATEGIES.BIP45
        ? this.copayerIndex + '/'
        : '') +
      (isChange ? 1 : 0) +
      '/' +
      0
    );
  }

  getCurrentAddressPath(isChange) {
    return (
      'm/' +
      (this.derivationStrategy == Constants.DERIVATION_STRATEGIES.BIP45
        ? this.copayerIndex + '/'
        : '') +
      (isChange ? 1 : 0) +
      '/' +
      (isChange ? this.changeAddressIndex : this.receiveAddressIndex)
    );
  }

  getNewAddressPath(isChange, step) {
    var ret;
    var i = 0;
    step = step || 1;

    while (i++ < step) {
      if (ret) {
        this.skippedPaths.push({ path: ret, isChange: isChange });
      }

      ret = this.getCurrentAddressPath(isChange);
      this._incrementIndex(isChange);
    }
    return ret;
  }

  getNextSkippedPath() {
    if (_.isEmpty(this.skippedPaths)) return null;

    var ret = this.skippedPaths.pop();
    return ret;
  }
}

module.exports = AddressManager;
