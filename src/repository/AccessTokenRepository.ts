import IAccessTokenModel from '@src/models/accessTokens/IAccessTokenModel';
import AccessTokenSchema from '@src/schemas/accessTokenSchema';
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

  public removeToken(token: string): void {
    try {
      AccessTokenSchema.remove({token});
    } catch (err) {
      throw err;
    }
  }

  public removeByUserIdAndClientId(userId: string, clientId: string): void {
    try {
      AccessTokenSchema.remove({userId: this.toObjectId(userId), client_id: clientId});
    } catch (err) {
      throw err;
    }
  }
}
