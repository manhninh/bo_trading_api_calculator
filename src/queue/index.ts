import config from '@src/config';
import {TypeUser, TYPE_ORDER} from '@src/contants/system';
import OrderRepository from '@src/repository/OrderRepository';
import UserRepository from '@src/repository/UserRepository';
import UserWalletRepository from '@src/repository/UserWalletRepository';
import {IOrderModel} from 'bo-trading-common/lib/models/orders';
import {logger} from 'bo-trading-common/lib/utils';
import kue, {DoneCallback, Job} from 'kue';

export default class QueueKue {
  queue = null;

  public processOrder = (userId: string) => {
    global.queue
      //queue handling order
      .process(`Order Queue ${userId}`, async (job: Job, done: DoneCallback) => {
        const order = job.data.order;
        /** kiểm tra số dư tài khoản có đủ để đặt lệnh */
        const userWalletRes = new UserWalletRepository();
        const userWallet = await userWalletRes.findOne({user_id: order.userId});
        if (userWallet) {
          let amountTrade = 0;
          let fieldUpdateAmount = '';
          switch (order.typeUser) {
            case TypeUser.DEMO:
              amountTrade = userWallet.amount_demo;
              fieldUpdateAmount = 'amount_demo';
              break;
            case TypeUser.EXPERT:
              amountTrade = userWallet.amount_expert;
              fieldUpdateAmount = 'amount_expert';
              break;
            case TypeUser.COPY_TRADE:
              amountTrade = userWallet.amount_copytrade;
              fieldUpdateAmount = 'amount_copytrade';
              break;
            default:
              amountTrade = userWallet.amount_trade;
              fieldUpdateAmount = 'amount_trade';
              break;
          }
          const orderRes = new OrderRepository();
          // nếu như tổng số buy/sell hiện tại + số tiền đánh lệnh > số tiền hiện tại thì không được đánh lệnh
          const totalAmountNew = amountTrade - order.amount;
          if (totalAmountNew >= 0) {
            const faker = require('faker');
            const order_uuid = faker.datatype.uuid();
            const resultOrder = await orderRes.create(<IOrderModel>{
              order_uuid,
              user_id: order.userId,
              type_user: order.typeUser,
              status_order: order.typeOrder === TYPE_ORDER.BUY ? false : true,
              amount_order: order.amount,
              prev_total_amount: amountTrade,
              status: false,
            });
            if (resultOrder) {
              const updateWallet = await userWalletRes.updateByUserId(order.userId, {
                [fieldUpdateAmount]: totalAmountNew,
              });
              if (updateWallet) done();
              else {
                orderRes.delete(resultOrder.id);
                done(new Error('Order fail!'));
              }
            } else {
              orderRes.delete(resultOrder.id);
              done(new Error('Order fail!'));
            }
          } else done(new Error('Your balance is not enough!'));
        } else done(new Error('Your balance is not enough!'));
      });
  };

  public init() {
    this.queue = kue.createQueue({
      redis: {
        port: config.REDIS_PORT,
        host: config.REDIS_HOST,
        auth: config.REDIS_AUTH,
      },
      jobEvents: false,
    });
    this.queue.setMaxListeners(20000);
    global.queue = this.queue;
    this.eventsQueue();

    //tạo queue xử lý cho tất cả các user
    const userRes = new UserRepository();
    userRes.findAll().then((user) => user.map((item) => this.processOrder(item.id.toString())));
  }

  private eventsQueue = () => {
    this.queue
      // error handling
      .on('error', (err: any) => {
        logger.error('QUEUE EROR: ', err);
      })
      // when job complete
      .on('job complete', (id: number) => {
        kue.Job.get(id, (err: any, job: any) => {
          if (err) return;
          this._logQueue(job);
        });
      })
      // when job fail
      .on('job failed', (id: number, errorMessage: string) => {
        kue.Job.get(id, (err: any, job: any) => {
          if (err) return;
          this._logQueue(job, errorMessage);
        });
      });
  };

  private _logQueue = (job: any, errMess?: string) => {
    // const queueLogRes = new QueueLogRepository();
    // queueLogRes.create(<IQueueLogModel>{
    //   logs: JSON.stringify({
    //     id: job.id,
    //     created_at: job.created_at,
    //     data: job.data,
    //     type: job.type,
    //     workerId: job.workerId,
    //     errorMessage: errMess,
    //   }),
    // });
    logger.error('QUEUE LOGS EROR: ', errMess);
    job.remove((err: any) => {
      if (err) throw err;
    });
  };
}
