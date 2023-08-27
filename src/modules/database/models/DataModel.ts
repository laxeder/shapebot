import { DataStatus } from "@modules/database/models/DataStatus";

export default class DataModel implements DataModel {
  id: string = "";
  status: DataStatus = DataStatus.Disabled;
  createdAt: string = "";
  updatedAt: string = "";

  public static inject<T extends DataModel>(oldData: T, newData: Partial<DataModel>) {
    const keys = Object.keys(newData) as Array<keyof typeof newData>;

    const emptyData = new DataModel();

    for (const key of keys) {
      if (!oldData.hasOwnProperty(key)) continue;
      if (typeof oldData[key] != typeof newData[key]) continue;
      if (emptyData.hasOwnProperty(key) && !newData[key]) continue;

      if (typeof oldData[key] == "object" && typeof newData == "object") {
        if ((oldData[key] as any) instanceof DataModel && (newData[key] as any) instanceof DataModel) {
          oldData[key] = DataModel.inject(oldData[key] as any, newData[key] as any);

          continue;
        }
      }

      oldData[key] = newData[key] as any;
    }

    return oldData;
  }
}
