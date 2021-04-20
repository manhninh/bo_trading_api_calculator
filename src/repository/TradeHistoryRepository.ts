import {ITradeHistoryModel} from 'bo-trading-common/lib/models/tradeHistories';
import {TradeHistorySchema} from 'bo-trading-common/lib/schemas';
import {RepositoryBase} from './base';

export default class TradeHistoryRepository extends RepositoryBase<ITradeHistoryModel> {
  constructor() {
    super(TradeHistorySchema);
  }
}
