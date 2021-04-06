import IRefeshTokenModel from './IRefeshTokenModel';

export default class RefeshTokenModel {
  private _refeshTokenModel: IRefeshTokenModel;

  constructor(RefeshTokenModel: IRefeshTokenModel) {
    this._refeshTokenModel = RefeshTokenModel;
  }

  get user_id(): string {
    return this._refeshTokenModel.user_id;
  }

  get client_id(): string {
    return this._refeshTokenModel.client_id;
  }

  get token(): string {
    return this._refeshTokenModel.token;
  }

  get createdAt(): string {
    return this._refeshTokenModel.createdAt;
  }
}
