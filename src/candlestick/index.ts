import {COMMISSION_LEVEL} from '@src/contants/commissionLevel';
import {TypeUser, TYPE_WIN} from '@src/contants/system';
import protectExchange from '@src/protectExchange';
import CommissionRepository from '@src/repository/CommissionRepository';
import OrderRepository from '@src/repository/OrderRepository';
import TradeHistoryRepository from '@src/repository/TradeHistoryRepository';
import UserRepository from '@src/repository/UserRepository';
import UserWalletRepository from '@src/repository/UserWalletRepository';
import {EMITS} from '@src/socketHandlers/EmitType';
import {ICommissionModel} from 'bo-trading-common/lib/models/commissions';
import {ITradeHistoryModel} from 'bo-trading-common/lib/models/tradeHistories';
import {logger} from 'bo-trading-common/lib/utils';
import moment from 'moment';
import {Socket} from 'socket.io-client';
import {EVENTS, ROOM} from './TypeHandlers';

type ResultBuySell = {
  event_time: string;
  open: number;
  close: number;
  high: number;
  low: number;
};

export default (io: Socket) => {
  try {
    io.on('connect', () => {
      io.emit(ROOM.ETHUSDT);
      protectExchange(io);
    });

    io.on('connect_error', (error: any) => {
      logger.error(`Socket Candlestick Connect Error: ${error.message}\n`);
    });

    io.on('error', (error: any) => {
      logger.error(`Socket Candlestick Error: ${error.message}\n`);
    });

    io.on('disconnect', (reason: string) => {});

    /** nhận kết quả trade mỗi 30s để tính toán thắng thua, tạo lịch sử giao dịch, hoa hồng, .... */
    io.on(EVENTS.RESULT_BUY_SELL, async (resultBuySell: ResultBuySell) => {
      // kết quả buy sell
      const resultWin =
        resultBuySell.open === resultBuySell.close
          ? TYPE_WIN.NEUTRAL
          : resultBuySell.open > resultBuySell.close
          ? TYPE_WIN.SELL
          : TYPE_WIN.BUY;
      const orderRes = new OrderRepository();
      const fromDate = new Date(moment(Number(resultBuySell.event_time)).subtract(30, 'seconds').toString());
      const toDate = new Date(moment(Number(resultBuySell.event_time)).add(29, 'seconds').toString());
      const resultOrder = await orderRes.totalBuySell(fromDate, toDate);
      if (resultOrder.length > 0) {
        Promise.all(
          resultOrder.map((item) => {
            const userId = item.user_id;
            const userReal = item.type_user[TypeUser.REAL];
            const userExpert = item.type_user[TypeUser.EXPERT];
            const userDemo = item.type_user[TypeUser.DEMO];
            // real account
            let amount_trade = null;
            if (userReal) amount_trade = _amountWinLoss(userReal, resultWin);

            // expert account
            let amount_expert = null;
            if (userExpert) amount_expert = _amountWinLoss(userExpert, resultWin);

            // demo account
            let amount_demo = null;
            if (userDemo) amount_demo = _amountWinLoss(userDemo, resultWin);

            // cập nhật ví người dùng
            const userWalletRes = new UserWalletRepository();
            userWalletRes.updateAmountTradeDemoExpert(
              userId,
              amount_trade ? (amount_trade.amountResult < 0 ? 0 : amount_trade.amountResult) : 0,
              amount_demo ? (amount_demo.amountResult < 0 ? 0 : amount_demo.amountResult) : 0,
              amount_expert ? (amount_expert.amountResult < 0 ? 0 : amount_expert.amountResult) : 0,
            );

            //emit to user
            global.io.sockets.to(userId.toString()).emit(EMITS.RESULT_BUY_SELL, {
              amount_trade: amount_trade ? amount_trade.amountResult : null,
              amount_expert: amount_expert ? amount_expert.amountResult : null,
              amount_demo: amount_demo ? amount_demo.amountResult : null,
            });

            return {
              userId,
              amount_trade,
              amount_expert,
              amount_demo,
            };
          }),
        )
          .then(async (resultOrder) => {
            if (resultOrder.length <= 0) return;
            Promise.all(
              resultOrder.map((item) => {
                // cập nhật tất cả các order cũ về trạng thái hoàn thành
                orderRes.updateOrderToFinish(fromDate, toDate);

                // tạo lịch sử giao dịch
                if (item.amount_trade) _createHistory(item.userId, resultBuySell, TypeUser.REAL, item.amount_trade);
                else if (item.amount_demo) _createHistory(item.userId, resultBuySell, TypeUser.DEMO, item.amount_demo);
                else if (item.amount_expert)
                  _createHistory(item.userId, resultBuySell, TypeUser.EXPERT, item.amount_expert);
              }),
            ).catch((error) => {
              logger.error(`History Error: ${error.message}\n`);
            });
          })
          .catch((error) => {
            logger.error(`History Error: ${error.message}\n`);
          });
      }
    });
  } catch (error) {
    logger.error(`Socket Candlestick Error: ${error.message}\n`);
  }
};

const _amountWinLoss = (
  userType: {true: number; false: number},
  resultBuySell: TYPE_WIN,
): {amountResult: number; buy: number; sell: number} => {
  const buy = userType.false || 0;
  const sell = userType.true || 0;
  let amountResult: number | null = null;
  if (resultBuySell === TYPE_WIN.BUY) {
    const amountBuy = buy + (buy * 95) / 100;
    amountResult = amountBuy - sell;
  } else if (resultBuySell === TYPE_WIN.SELL) {
    const amountSell = sell + (sell * 95) / 100;
    amountResult = amountSell - buy;
  }
  if (amountResult) amountResult = Math.round(amountResult * 100) / 100;
  return {amountResult, buy, sell};
};

const _createHistory = (
  userId: string,
  resultBuySell: ResultBuySell,
  typeUser: TypeUser,
  amount: {amountResult: number; buy: number; sell: number},
) => {
  const tradeHistory = new TradeHistoryRepository();
  const tradeModel = <ITradeHistoryModel>{
    order_uuid: resultBuySell.event_time,
    user_id: userId,
    buy_amount_order: amount.buy,
    sell_amount_order: amount.sell,
    open_result: resultBuySell.open,
    close_result: resultBuySell.close,
    amount_result: amount.amountResult,
    type: typeUser,
  };
  tradeHistory.create(tradeModel).then(async (resultHistory) => {
    // chi trả hoa hồng cho các IB
    const commissionRes = new CommissionRepository();
    const userRes = new UserRepository();
    const commissionLevel = await userRes.commissionLevel(resultHistory.user_id);
    if (commissionLevel.length > 0) {
      Promise.all(
        commissionLevel.map((item, index: number) => {
          // kiểm tra nếu user đã mua gói IB
          userRes.findOne({_id: userRes.toObjectId(item), is_sponsor: true}).then((resultUser) => {
            if (resultUser) {
              const level_commission = COMMISSION_LEVEL[index];
              const amount_commission =
                ((resultHistory.buy_amount_order + resultHistory.sell_amount_order) * level_commission) / 100;
              // tạo hoa hồng cho IB
              commissionRes.create(<ICommissionModel>{
                type_commission: 0,
                id_user: resultHistory.user_id,
                id_user_ref: resultUser.id,
                id_history: resultHistory.id,
                level: index + 1,
                investment_amount: resultHistory.buy_amount_order + resultHistory.sell_amount_order,
                commission: amount_commission,
                is_withdraw: false,
              });
            }
          });
        }),
      );
    }
  });
};
