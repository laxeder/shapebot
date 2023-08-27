import { DataStatus } from "@modules/database/shared/DataStatus";
import IDataModel from "@modules/database/interfaces/DataModel";

/**
 * Classe base para modelos de dados comuns.
 */
export default class DataModel implements IDataModel {
  id: string = "";
  status: DataStatus = DataStatus.Disabled;
  createdAt: string = "";
  updatedAt: string = "";

  /**
   * Substitui as propriedades dos dados existente por novos dados.
   * @param oldData - Os dados existente.
   * @param newData - Os novos dados para serem injetados.
   * @param force - Se verdadeiro, força a injeção de todos os novos dados
   * @returns Os dados existente com as propriedades atualizadas.
   */
  public static inject<T extends DataModel>(oldData: T, newData: Partial<DataModel>, force: boolean = false): T {
    if (!oldData || oldData == null || typeof oldData != "object") {
      return new DataModel() as T;
    }

    const keys = Object.keys(newData) as Array<keyof typeof newData>;

    const emptyData = new DataModel();

    for (const key of keys) {
      if (!force) {
        if (!oldData.hasOwnProperty(key)) continue;
        if (typeof oldData[key] != typeof newData[key]) continue;
        if (emptyData.hasOwnProperty(key) && !newData[key]) continue;
      }

      if (typeof oldData[key] == "object" && typeof newData == "object") {
        if ((oldData[key] as any) instanceof DataModel && (newData[key] as any) instanceof DataModel) {
          //@ts-ignore
          oldData[key] = DataModel.inject(oldData[key] as any, newData[key] as any);

          continue;
        }
      }

      oldData[key] = newData[key] as any;
    }

    return oldData;
  }
}
