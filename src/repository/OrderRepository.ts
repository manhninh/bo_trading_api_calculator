import {IOrderModel} from 'bo-trading-common/lib/models/orders';
import {OrderSchema} from 'bo-trading-common/lib/schemas';
import {RepositoryBase} from './base';

export default class OrderRepository extends RepositoryBase<IOrderModel> {
  constructor() {
    super(OrderSchema);
  }

  public async totalBuySell(): Promise<any[]> {
    try {
      const result = await OrderSchema.aggregate([
        {
          $match: {
            status: false,
          },
        },
        {
          $group: {
            _id: {
              user_id: '$user_id',
              status_order: '$status_order',
            },
            amount_order: {
              $sum: '$amount_order',
            },
          },
        },
        {
          $group: {
            _id: '$_id.user_id',
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
            _id: '$_id',
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
      ]);
      return result;
    } catch (err) {
      throw err;
    }
  }
}
