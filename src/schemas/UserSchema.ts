import IUserModel from '@src/models/users/IUserModel';
import {pbkdf2Sync, randomBytes} from 'crypto';
import mongoose, {Schema} from 'mongoose';

class UserSchema {
  static get schema() {
    const schema = new mongoose.Schema(
      {
        username: {type: Schema.Types.String, required: true, unique: true},
        email: {type: Schema.Types.String, index: true, required: true, unique: true},
        salt: {type: Schema.Types.String, required: true},
        hashed_password: {type: Schema.Types.String, required: true},
        full_name: {type: Schema.Types.String, default: ''},
        phone: {type: Schema.Types.String},
        type_user: {type: Schema.Types.Number, required: true, default: 0}, // 0: Real - 1: Demo
        user_parent_id: {type: Schema.Types.ObjectId},
        tfa: {type: Schema.Types.String},
        commission_level: {type: Schema.Types.Array},
        ref_code: {type: Schema.Types.String},
        amount: {type: Schema.Types.Number, required: true, default: 0},
        verify_code: {type: Schema.Types.String},
        status: {type: Schema.Types.Number, required: true, default: 0}, // 0: Not Active - 1: Active - 2: Block
      },
      {
        timestamps: true,
      },
    );

    /** virtual */
    schema
      .virtual('password')
      .set(function (this: IUserModel, password: string) {
        this._plain_password = password;
        const salt = randomBytes(128).toString('hex');
        this.salt = salt;
        const hashedPassword = this.encryptPassword(password);
        this.hashed_password = hashedPassword;
      })
      .get(function (this: IUserModel) {
        return this._plain_password;
      });

    /** method */
    schema.methods.encryptPassword = function (this: IUserModel, password: string) {
      return pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    };

    schema.methods.checkPassword = function (this: IUserModel, password: string) {
      return this.encryptPassword(password) === this.hashed_password;
    };

    /** return */
    return schema;
  }
}

export default mongoose.model<IUserModel>('users', UserSchema.schema);
