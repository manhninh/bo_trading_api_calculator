import mongoose, { FilterQuery } from 'mongoose';

export default interface IRead<T extends mongoose.Document> {
  findById(id: string): Promise<T>;
  findAll(): Promise<T[]>;
  findOne(filter: FilterQuery<T>): Promise<T>;
}
