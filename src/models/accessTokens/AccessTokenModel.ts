import IAccessTokenModel from './IAccessTokenModel';

export default class AccessTokenModel {
  private _AccessTokenModel: IAccessTokenModel;

  constructor(AccessTokenModel: IAccessTokenModel) {
    this._AccessTokenModel = AccessTokenModel;
  }

  get user_id(): string {
    return this._AccessTokenModel.user_id;
  }

  get client_id(): string {
    return this._AccessTokenModel.client_id;
  }

  get token(): string {
    return this._AccessTokenModel.token;
  }

  get createdAt(): string {
    return this._AccessTokenModel.createdAt;
  }
}
