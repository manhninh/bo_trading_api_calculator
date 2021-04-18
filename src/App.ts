import express from 'express';
import {UserWalletWatch} from './mongodbWatch/userWallet';
import Scheduler from './schedulers';

class App {
  public app: express.Application;
  public scheduler: Scheduler;

  constructor() {
    this.app = express();
    this.init();
    /** cronjob */
    new Scheduler().config();
  }

  private init() {
    // lắng nghe thay đổi trong bảng user_wallets
    UserWalletWatch();
  }
}

export default new App().app;
