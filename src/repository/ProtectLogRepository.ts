import {IProtectLogModel} from 'bo-trading-common/lib/models/protectLogs';
import {ProtectLogSchema} from 'bo-trading-common/lib/schemas';
import {RepositoryBase} from './base';

export default class ProtectLogRepository extends RepositoryBase<IProtectLogModel> {
  constructor() {
    super(ProtectLogSchema);
  }

  public async limitTopNewProtect(): Promise<IProtectLogModel[]> {
    try {
      const result = await ProtectLogSchema.find().sort({createdAt: -1}).limit(20);
      return result.reverse();
    } catch (err) {
      throw err;
    }
  }
}
