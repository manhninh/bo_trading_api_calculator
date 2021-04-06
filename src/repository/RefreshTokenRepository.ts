import IRefreshTokenModel from '@src/models/refeshTokens/IRefeshTokenModel';
import RefreshTokenSchema from '@src/schemas/RefreshTokenSchema';
import {RepositoryBase} from './base';

export default class RefreshTokenRepository extends RepositoryBase<IRefreshTokenModel> {
  constructor() {
    super(RefreshTokenSchema);
  }

  public removeByUserIdAndClientId(userId: string, clientId: string): void {
    try {
      RefreshTokenSchema.remove({userId: this.toObjectId(userId), client_id: clientId});
    } catch (err) {
      throw err;
    }
  }

  public async findByToken(token: string): Promise<IRefreshTokenModel> {
    try {
      const result = await RefreshTokenSchema.findOne({token});
      return result;
    } catch (err) {
      throw err;
    }
  }
}
