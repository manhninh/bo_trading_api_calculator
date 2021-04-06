import mongoose, {FilterQuery} from 'mongoose';
import IRead from '../interfaces/IRead';
import IWrite from '../interfaces/IWrite';

export class RepositoryBase<T extends mongoose.Document> implements IRead<T>, IWrite<T> {
  private _model: mongoose.Model<T>;

  constructor(schemaModel: mongoose.Model<T>) {
    this._model = schemaModel;
  }

  public async findById(id: string): Promise<T> {
    try {
      const result = await this._model.findById(id);
      return result as T;
    } catch (err) {
      throw err;
    }
  }

  public async findOne(filter: FilterQuery<T>): Promise<T> {
    try {
      const result = await this._model.findOne(filter);
      return result as T;
    } catch (err) {
      throw err;
    }
  }

  public async findAll(): Promise<T[]> {
    try {
      const result = await this._model.find({});
      return result as T[];
    } catch (err) {
      throw err;
    }
  }

  public async create(item: T): Promise<T> {
    try {
      const result = await this._model.create(item);
      return result as T;
    } catch (err) {
      throw err;
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this._model.remove({id});
      return true;
    } catch (err) {
      throw err;
    }
  }

  public toObjectId(id: string): mongoose.Types.ObjectId {
    return mongoose.Types.ObjectId.createFromHexString(id);
  }
}
