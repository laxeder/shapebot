import DataModel from "@modules/database/models/DataModel";

export default class User extends DataModel {
  public botId: string = "";
  public id: string = "";

  constructor(data: any = {}) {
    super();

    DataModel.inject(this, data);
  }
}
