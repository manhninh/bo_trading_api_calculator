import mongoose from 'mongoose';

export default interface IClientModel extends mongoose.Document {
  name: string;
  client_id: string;
  client_secret: string;
}
