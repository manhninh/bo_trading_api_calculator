import express from 'express';
import QueueKue from './queue';
import Scheduler from './schedulers';

class App {
  public app: express.Application;
  public scheduler: Scheduler;

  constructor() {
    this.app = express();
    // config queue
    const queue = new QueueKue();
    queue.init();

    this.init();
    /** cronjob */
    new Scheduler().config();
  }

  private init() {}
}

export default new App().app;
