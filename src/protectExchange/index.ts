import {PROTECT_STATUS, TYPE_WIN} from '@src/contants/system';
import OrderRepository from '@src/repository/OrderRepository';
import ProtectLogRepository from '@src/repository/ProtectLogRepository';
import {EMITS} from '@src/socketHandlers/EmitType';
import {IProtectLogModel} from 'bo-trading-common/lib/models/protectLogs';
import {logger} from 'bo-trading-common/lib/utils';
import moment from 'moment';
import {Socket} from 'socket.io-client';

export default (ioCandlestick: Socket) => {
  try {
    let buyOrder = [];
    let sellOrder = [];
    const orderRes = new OrderRepository();
    setInterval(async () => {
      const timeTick = moment(new Date()).unix() % 60;
      if (timeTick >= 0 && timeTick < 30) {
        global.protectBO = PROTECT_STATUS.NORMAL;
        if (buyOrder.length > 0) {
          buyOrder = [];
          global.io.sockets.to('administrator').emit(EMITS.ORDER_BUY_QUEUE, []);
        }
        if (sellOrder.length > 0) {
          sellOrder = [];
          global.io.sockets.to('administrator').emit(EMITS.ORDER_SELL_QUEUE, []);
        }
      } else if (timeTick % 5 == 0 && timeTick >= 30 && timeTick <= 50) {
        buyOrder = await orderRes.totalOrders(false);
        global.io.sockets.to('administrator').emit(EMITS.ORDER_BUY_QUEUE, buyOrder);
        sellOrder = await orderRes.totalOrders(true);
        global.io.sockets.to('administrator').emit(EMITS.ORDER_SELL_QUEUE, sellOrder);
      } else if (timeTick === 51) {
        const totalBuy = buyOrder.reduce((sum, item) => sum + item.amount_order, 0);
        const totalSell = sellOrder.reduce((sum, item) => sum + item.amount_order, 0);
        const diff = Math.abs(totalBuy - totalSell);
        if (global.protectBO !== PROTECT_STATUS.NORMAL) {
          ioCandlestick.emit(EMITS.PROTECT_STATUS, global.protectBO);
          protectLogSave(<ProtectLog>{type: 0, level: 0, totalBuy, totalSell, status: global.protectBO});
        } else {
          const changeProtect = ({type, level}) => {
            const currentStatus = totalBuy > totalSell ? TYPE_WIN.BUY : TYPE_WIN.SELL;
            if (currentStatus === TYPE_WIN.BUY) {
              ioCandlestick.emit(EMITS.PROTECT_STATUS, PROTECT_STATUS.SELL_WIN);
              protectLogSave(<ProtectLog>{type, level, totalBuy, totalSell, status: PROTECT_STATUS.SELL_WIN});
            } else {
              ioCandlestick.emit(EMITS.PROTECT_STATUS, PROTECT_STATUS.BUY_WIN);
              protectLogSave(<ProtectLog>{type, level, totalBuy, totalSell, status: PROTECT_STATUS.BUY_WIN});
            }
          };

          if (diff >= 1 && diff < 10) {
            if (global.currentProtectLevel1 > global.protectLevel1) {
              changeProtect({type: 1, level: 1});
              global.currentProtectLevel1 = 0;
            } else global.currentProtectLevel1 += 1;
          } else if (diff >= 10 && diff < 50) {
            if (global.currentProtectLevel2 > global.protectLevel2) {
              changeProtect({type: 1, level: 2});
              global.currentProtectLevel2 = 0;
            } else global.currentProtectLevel2 += 1;
          } else if (diff >= 50 && diff < 200) {
            if (global.currentProtectLevel3 > global.protectLevel3) {
              changeProtect({type: 1, level: 3});
              global.currentProtectLevel3 = 0;
            } else global.currentProtectLevel3 += 1;
          } else if (diff >= 200 && diff < 1000) {
            if (global.currentProtectLevel4 > global.protectLevel4) {
              changeProtect({type: 1, level: 4});
              global.currentProtectLevel4 = 0;
            } else global.currentProtectLevel4 += 1;
          } else if (diff >= 1000) {
            changeProtect({type: 1, level: 5});
          }
        }
      }
    }, 1000);
  } catch (error) {
    logger.error(`Protect Exchange Error: ${error.message}\n`);
  }
};

type ProtectLog = {
  type: number;
  level: number;
  totalBuy: number;
  totalSell: number;
  status: PROTECT_STATUS;
};

// log protect
const protectLogSave = (logs: ProtectLog) => {
  let diff = 0;
  if (logs.status === PROTECT_STATUS.BUY_WIN) {
    const current = logs.totalBuy * 0.95;
    if (current > logs.totalSell) diff = diff = (current - logs.totalSell) * -1;
    else diff = logs.totalSell - current;
  } else if (logs.status === PROTECT_STATUS.SELL_WIN) {
    const current = logs.totalSell * 0.95;
    if (current > logs.totalBuy) diff = (current - logs.totalBuy) * -1;
    else diff = logs.totalBuy - current;
  }

  const protectModel = <IProtectLogModel>{
    type: logs.type,
    level: logs.level,
    diff,
  };
  const protectLogRes = new ProtectLogRepository();
  protectLogRes.create(protectModel).then((protectlog) => {
    global.io.sockets.to('administrator').emit(EMITS.ADMIN_PROTECT_LOG_NEW, protectlog);
  });
};
