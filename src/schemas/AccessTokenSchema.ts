import IAccessTokenModel from '@src/models/accessTokens/IAccessTokenModel';
import mongoose, { Schema } from 'mongoose';

class AccessTokenSchema {
  static get schema() {
    const schema = new mongoose.Schema({
      user_id: { type: Schema.Types.ObjectId, required: true, },
      client_id: { type: Schema.Types.String, required: true, },
      token: { type: String, required: true, }
    }, {
      timestamps: true
    });
    return schema;
  }
}

export default mongoose.model<IAccessTokenModel>('access_tokens', AccessTokenSchema.schema);
