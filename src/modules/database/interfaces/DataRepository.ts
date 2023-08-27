import DataModel from "@modules/database/interfaces/DataModel";

export default interface DataRepository<T extends DataModel> {
  create(data: T): Promise<void>;
  read(data: T): Promise<T>;
  update(data: Partial<T>): Promise<void>;
  delete(data: T): Promise<void>;
  restore(data: T): Promise<void>;
  findAll(...keys: string[]): Promise<T[]>;
}
