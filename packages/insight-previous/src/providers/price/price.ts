import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import * as _ from 'lodash';
import { ApiProvider } from '../api/api';
import { CurrencyProvider } from '../currency/currency';

@Injectable()
export class PriceProvider {
  private rates = {};

  constructor(
    public currencyProvider: CurrencyProvider,
    public api: ApiProvider,
    private toastCtrl: ToastController
  ) {}

  public setCurrency(currency?: string): void {
    if (!currency) {
      currency = this.currencyProvider.getCurrency();
    }

    if (currency === 'USD') {
      const ratesAPI =
        this.api.getConfig().chain === 'BTC'
          ? this.api.ratesAPI.btc
          : this.api.ratesAPI.bch;
      this.api.httpClient.get(ratesAPI).subscribe(
        (data: any) => {
          const currencyParsed: any = data;
          _.each(currencyParsed, o => {
            this.rates[o.code] = o.rate;
          });
          this.currencyProvider.factor = this.rates[currency];
          this.currencyProvider.loading = false;
        },
        err => {
          this.currencyProvider.loading = false;
          this.showErrorToast();
          throw err;
        }
      );
    } else {
      this.currencyProvider.factor =
        currency === 'm' + this.api.networkSettings.selectedNetwork.chain
          ? 1000
          : 1;
    }
  }

  private showErrorToast() {
    const toast: any = this.toastCtrl.create({
      message: 'This currency is not available at this time',
      duration: 3000,
      position: 'top'
    });
    toast.present();
    toast.onDidDismiss(() => {
      this.currencyProvider.setCurrency();
    });
  }
}
