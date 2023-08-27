import DataModel from "./DataModel";

export default interface Database {
  save(key: string, data: DataModel): Promise<void>;
  get(key: string, id: string): Promise<DataModel>;
  remove(key: string, id: string): Promise<void>;
  findAll(key: string): Promise<DataModel[]>;
}
