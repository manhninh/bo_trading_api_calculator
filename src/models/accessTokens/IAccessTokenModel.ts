import mongoose from 'mongoose';

export default interface IAccessTokenModel extends mongoose.Document {
  user_id: string;
  client_id: string;
  token: string;
  createdAt: string;
}
