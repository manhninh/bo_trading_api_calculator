import {IUserWalletModel} from 'bo-trading-common/lib/models/userWallets';
import {UserWalletSchema} from 'bo-trading-common/lib/schemas';
import {RepositoryBase} from './base';

export default class UserWalletRepository extends RepositoryBase<IUserWalletModel> {
  constructor() {
    super(UserWalletSchema);
  }

  public async updateAmountTradeDemoExpert(
    userId: string,
    amount_trade: number,
    amount_demo: number,
    amount_expert: number,
  ) {
    try {
      const result = await UserWalletSchema.findOneAndUpdate(
        {user_id: userId},
        {
          $inc: {
            amount_trade,
            amount_demo,
            amount_expert,
          },
        },
      );
      return result;
    } catch (err) {
      throw err.errors ? err.errors.shift() : err;
    }
  }
}
