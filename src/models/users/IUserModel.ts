import mongoose from 'mongoose';

export default interface IUserModel extends mongoose.Document {
  full_name: string;
  username: string;
  email: string;
  salt: string;
  hashed_password: string;
  phone: string;
  type_user: number;
  user_parent_id: string;
  tfa: string;
  commission_level: string[];
  ref_code: string;
  amount: number;
  verify_code: string;
  status: number;
  /** private variable */
  _plain_password: string;
  /** virtual */
  password: string;
  /** methods */
  encryptPassword: (password: string) => string;
  checkPassword: (password: string) => boolean;
}
