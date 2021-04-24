import {ICommissionModel} from 'bo-trading-common/lib/models/commissions';
import {CommissionSchema} from 'bo-trading-common/lib/schemas';
import {RepositoryBase} from './base';

export default class CommissionRepository extends RepositoryBase<ICommissionModel> {
  constructor() {
    super(CommissionSchema);
  }
}
