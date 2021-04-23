import express from 'express';
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

  private init() {}
}

export default new App().app;
