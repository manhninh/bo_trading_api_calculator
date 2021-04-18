import {IAccessTokenModel} from 'bo-trading-common/lib/models/accessTokens';
import {AccessTokenSchema} from 'bo-trading-common/lib/schemas';
import {RepositoryBase} from './base';

export default class AccessTokenRepository extends RepositoryBase<IAccessTokenModel> {
  constructor() {
    super(AccessTokenSchema);
  }

  public async findByToken(token: string): Promise<IAccessTokenModel> {
    try {
      const result = await AccessTokenSchema.findOne({token});
      return result;
    } catch (err) {
      throw err;
    }
  }

  public async removeToken(token: string): Promise<void> {
    try {
      await AccessTokenSchema.findOneAndRemove({token});
    } catch (err) {
      throw err;
    }
  }

  public async removeByUserIdAndClientId(userId: string, clientId: string): Promise<void> {
    try {
      await AccessTokenSchema.deleteMany({userId: this.toObjectId(userId), client_id: clientId});
    } catch (err) {
      throw err;
    }
  }
}
