import {PROTECT_STATUS, TYPE_WIN} from '@src/contants/system';
import OrderRepository from '@src/repository/OrderRepository';
import {EMITS} from '@src/socketHandlers/EmitType';
import {logger} from 'bo-trading-common/lib/utils';
import moment from 'moment';
import {Socket} from 'socket.io-client';

export default (ioCandlestick: Socket) => {
  try {
    let buyOrder = [];
    let sellOrder = [];
    setInterval(async () => {
      const timeTick = moment(new Date()).unix() % 60;
      if (timeTick === 0) {
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
        const orderRes = new OrderRepository();
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
        } else {
          const changeProtect = () => {
            const currentStatus = totalBuy > totalSell ? TYPE_WIN.BUY : TYPE_WIN.SELL;
            if (currentStatus === TYPE_WIN.BUY) ioCandlestick.emit(EMITS.PROTECT_STATUS, PROTECT_STATUS.SELL_WIN);
            else ioCandlestick.emit(EMITS.PROTECT_STATUS, PROTECT_STATUS.BUY_WIN);
          };
          if (diff >= 10 && diff < 50) {
            if (global.currentProtectLevel1 > global.protectLevel1) {
              changeProtect();
              global.currentProtectLevel1 = 0;
            } else global.currentProtectLevel1 += 1;
          } else if (diff >= 50 && diff < 200) {
            if (global.currentProtectLevel2 > global.protectLevel2) {
              changeProtect();
              global.currentProtectLevel2 = 0;
            } else global.currentProtectLevel2 += 1;
          } else if (diff >= 200 && diff < 1000) {
            if (global.currentProtectLevel3 > global.protectLevel3) {
              changeProtect();
              global.currentProtectLevel3 = 0;
            } else global.currentProtectLevel3 += 1;
          } else if (diff >= 1000) changeProtect();
        }
      }
    }, 1000);
  } catch (error) {
    logger.error(`Protect Exchange Error: ${error.message}\n`);
  }
};
