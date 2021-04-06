import IUserModel from './IUserModel';

export default class UserModel {
  private _userModel: IUserModel;

  constructor(UserModel: IUserModel) {
    this._userModel = UserModel;
  }

  get full_name(): string {
    return this._userModel.full_name;
  }

  get username(): string {
    return this._userModel.username;
  }

  get email(): string {
    return this._userModel.email;
  }

  get salt(): string {
    return this._userModel.salt;
  }

  get hashed_password(): string {
    return this._userModel.hashed_password;
  }

  get phone(): string {
    return this._userModel.phone;
  }

  get type_user(): number {
    return this._userModel.type_user;
  }

  get user_parent_id(): string {
    return this._userModel.user_parent_id;
  }

  get tfa(): string {
    return this._userModel.tfa;
  }

  get commission_level(): string[] {
    return this._userModel.commission_level;
  }

  get ref_code(): string {
    return this._userModel.ref_code;
  }

  get amount(): number {
    return this._userModel.amount;
  }

  get verify_code(): string {
    return this._userModel.verify_code;
  }

  get status(): number {
    return this._userModel.status;
  }
}
