import express from 'express';
import config from './config';
import {PROTECT_STATUS} from './contants/system';
import QueueKue from './queue';
import SystemConfigRepository from './repository/SystemConfigRepository';
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

  private async init() {
    // lấy thông tin các mức bảo vệ sàn trong bảng cấu hình
    const systemConfigRes = new SystemConfigRepository();
    const systemConfig = await systemConfigRes.getConfigProtectLevel();
    global.protectLevel1 = Number(
      systemConfig.find((item) => item.key === config.SYSTEM_PROTECT_LEVEL_1 && item.active == true)?.value || 0,
    );

    global.protectLevel2 = Number(
      systemConfig.find((item) => item.key === config.SYSTEM_PROTECT_LEVEL_2 && item.active == true)?.value || 0,
    );

    global.protectLevel3 = Number(
      systemConfig.find((item) => item.key === config.SYSTEM_PROTECT_LEVEL_3 && item.active == true)?.value || 0,
    );

    global.protectLevel4 = Number(
      systemConfig.find((item) => item.key === config.SYSTEM_PROTECT_LEVEL_4 && item.active == true)?.value || 0,
    );

    global.currentProtectLevel1 = 1;
    global.currentProtectLevel2 = 1;
    global.currentProtectLevel3 = 1;
    global.currentProtectLevel4 = 1;

    // đặt bảo vệ sàn ở chế độ normal khi khởi động server
    global.protectBO = PROTECT_STATUS.NORMAL;
  }
}

export default new App().app;
