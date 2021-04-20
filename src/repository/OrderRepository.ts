import {IOrderModel} from 'bo-trading-common/lib/models/orders';
import {OrderSchema} from 'bo-trading-common/lib/schemas';
import {RepositoryBase} from './base';

export default class OrderRepository extends RepositoryBase<IOrderModel> {
  constructor() {
    super(OrderSchema);
  }

  public async totalBuySell(fromDate: Date, toDate: Date): Promise<any[]> {
    try {
      const result = await OrderSchema.aggregate([
        {
          $match: {
            status: false,
            createdAt: {
              $gte: fromDate,
              $lt: toDate,
            },
          },
        },
        {
          $group: {
            _id: {
              user_id: '$user_id',
              status_order: '$status_order',
              type_user: '$type_user',
            },
            amount_order: {$sum: '$amount_order'},
          },
        },
        {
          $group: {
            _id: {
              user_id: '$_id.user_id',
              type_user: '$_id.type_user',
            },
            status_order: {
              $push: {
                status_order: '$_id.status_order',
                amount_order: '$amount_order',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            user_id: '$_id.user_id',
            type_user: '$_id.type_user',
            status_order: {
              $arrayToObject: {
                $map: {
                  input: '$status_order',
                  as: 'el',
                  in: {
                    k: {$toString: '$$el.status_order'},
                    v: '$$el.amount_order',
                  },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: '$user_id',
            status_order: {
              $addToSet: {
                type_user: '$type_user',
                status_order: '$status_order',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            user_id: '$_id',
            type_user: {
              $arrayToObject: {
                $map: {
                  input: '$status_order',
                  as: 'el',
                  in: {
                    k: {$toString: '$$el.type_user'},
                    v: '$$el.status_order',
                  },
                },
              },
            },
          },
        },
      ]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  public async updateOrderToFinish(fromDate: Date, toDate: Date): Promise<any> {
    try {
      const result = await OrderSchema.updateMany(
        {
          status: false,
          createdAt: {
            $gte: fromDate,
            $lt: toDate,
          },
        },
        {
          status: true,
        },
      );
      return result;
    } catch (err) {
      throw err;
    }
  }
}
