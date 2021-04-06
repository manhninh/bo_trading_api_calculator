import mongoose from 'mongoose';

export default interface IRefeshTokenModel extends mongoose.Document {
  user_id: string;
  client_id: string;
  token: string;
  createdAt: string;
}
