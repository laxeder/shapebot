import DataModel from "@modules/database/models/DataModel";

export default class Bot extends DataModel {
  public name: string = "";
  public admins: string[] = [];
  public attendants: string[] = [];
  public devChats: string[] = [];

  constructor(data: Partial<Bot> = {}) {
    super();

    DataModel.inject(this, data);
  }

  public isAdmin(id: string) {
    return this.admins.includes(String(id));
  }

  public isAttendant(id: string) {
    return this.attendants.includes(String(id));
  }

  public hasAdminPermission(id: string) {
    return this.admins.includes(String(id));
  }

  public hasAttendantPermission(id: string) {
    return this.attendants.includes(String(id)) || this.hasAdminPermission(id);
  }
}
