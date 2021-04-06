import IClientModel from './IClientModel';

export default class ClientModel {
  private _clientModel: IClientModel;

  constructor(ClientModel: IClientModel) {
    this._clientModel = ClientModel;
  }
  get client_id(): string {
    return this._clientModel.client_id;
  }

  get client_secret(): string {
    return this._clientModel.client_secret;
  }

  get name(): string {
    return this._clientModel.name;
  }
}
