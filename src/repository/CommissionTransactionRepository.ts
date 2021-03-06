import {ICommissionTransactionModel} from 'bo-trading-common/lib/models/commissionTransactions';
import {CommissionTransactionSchema} from 'bo-trading-common/lib/schemas';
import {RepositoryBase} from './base';

export default class CommissionTransactionRepository extends RepositoryBase<ICommissionTransactionModel> {
  constructor() {
    super(CommissionTransactionSchema);
  }
}
