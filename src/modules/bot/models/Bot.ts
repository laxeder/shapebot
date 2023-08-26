import DataModel from "@modules/database/models/DataModel";

export default class Bot extends DataModel {
  public name: string = "";
  public admins: string[] = [];
  public devChats: string[] = [];

  constructor(data: Partial<Bot> = {}) {
    super();

    DataModel.inject(this, data);
  }
}
