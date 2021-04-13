import { UserWalletSchema } from 'bo-trading-common/lib/schemas';
import express from 'express';
import Scheduler from './schedulers';

class App {
  public app: express.Application;
  public scheduler: Scheduler;

  constructor() {
    this.init();
    /** cronjob */
    new Scheduler().config();
  }

  private init() {
    const pipeline = [
      {
        "$match": { "operationType": "update" }
      },
      {
        "$project": {
          "fullDocument.amount_trade": 1,
          "fullDocument.amount_demo": 1,
          "fullDocument.amount_expert": 1,
          "fullDocument.amount_copytrade": 1
        }
      }
    ];
    UserWalletSchema.watch(pipeline).on('change', data => {
      console.log(new Date(), data);
    });
  }
}

export default new App().app;
