import config from '@src/config';
import {ISystemConfigModel} from 'bo-trading-common/lib/models/systemConfig';
import {SystemConfigSchema} from 'bo-trading-common/lib/schemas';
import {RepositoryBase} from './base';

export default class SystemConfigRepository extends RepositoryBase<ISystemConfigModel> {
  constructor() {
    super(SystemConfigSchema);
  }

  public async getConfigProtectLevel(): Promise<ISystemConfigModel[]> {
    try {
      const result = await SystemConfigSchema.find({
        key: {
          $in: [config.SYSTEM_PROTECT_LEVEL_1, config.SYSTEM_PROTECT_LEVEL_2, config.SYSTEM_PROTECT_LEVEL_3, config.SYSTEM_PROTECT_LEVEL_4],
        },
      });
      return result;
    } catch (err) {
      throw err;
    }
  }
}
