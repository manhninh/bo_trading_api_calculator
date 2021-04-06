import IClientModel from '@src/models/clients/IClientModel';
import mongoose, { Schema } from 'mongoose';

class ClientSchema {
  static get schema() {
    const schema = new mongoose.Schema({
      name: {
        type: Schema.Types.String,
        unique: true,
        required: true
      },
      client_id: {
        type: Schema.Types.String,
        unique: true,
        required: true
      },
      client_secret: {
        type: Schema.Types.String,
        required: true
      }
    }, {
      timestamps: true
    });
    return schema;
  }
}

export default mongoose.model<IClientModel>('clients', ClientSchema.schema);
