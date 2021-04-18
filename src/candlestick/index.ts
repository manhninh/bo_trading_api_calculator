import {TYPE_WIN} from '@src/contants/system';
import OrderRepository from '@src/repository/OrderRepository';
import {EMITS} from '@src/socketHandlers/EmitType';
import {formatter2} from '@src/utils/Formatter';
import {logger} from 'bo-trading-common/lib/utils';
import {Socket} from 'socket.io-client';
import {EVENTS, ROOM} from './TypeHandlers';

export default (io: Socket) => {
  try {
    io.on('connect', () => {
      logger.info(`Socket Candlestick Connection Success: ${io.id}`);
      io.emit(ROOM.ETHUSDT);
    });

    io.on('connect_error', (error: any) => {
      logger.error(`Socket Candlestick Connect Error: ${error.message}\n`);
    });

    io.on('error', (error: any) => {
      logger.error(`Socket Candlestick Error: ${error.message}\n`);
    });

    io.on('disconnect', (reason: string) => {
      logger.error(`Socket Candlestick Disconnected: ${reason}\n`);
    });

    /** nhận dữ liệu đóng mở trade mỗi 30s một lần */
    io.on(EVENTS.RESULT_BUY_SELL, async (result: any) => {
      console.log(result);
      // kết quả buy sell
      const resultBuySell =
        result.open === result.close ? TYPE_WIN.NEUTRAL : result.open > result.close ? TYPE_WIN.SELL : TYPE_WIN.BUY;
      const orderRes = new OrderRepository();
      const resultOrder = await orderRes.totalBuySell();
      if (resultOrder.length > 0) {
        Promise.all(
          resultOrder.map((item) => {
            const userId = item._id;
            const buy = item.status_order.true;
            const sell = item.status_order.false;
            console.log(userId, buy, sell);
            let amountResult = 0;
            if (resultBuySell === TYPE_WIN.BUY) {
              const amountBuy = (buy * 95) / 100;
              amountResult = amountBuy - sell;
            } else if (resultBuySell === TYPE_WIN.SELL) {
              const amountSell = (buy * 95) / 100;
              amountResult = amountSell - buy;
            }
            amountResult = Number(formatter2.format(amountResult));
            //emit to user
            global.io.sockets.to(userId.toString()).emit(EMITS.RESULT_BUY_SELL, amountResult);
          }),
        );
      } else {
        logger.error(`Cannot return result!`);
      }
    });
  } catch (error) {
    logger.error(`Socket Candlestick Error: ${error.message}\n`);
  }
};
