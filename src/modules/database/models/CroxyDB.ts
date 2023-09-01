import Database from "@modules/database/interfaces/Database";
import DataModel from "@modules/database/models/DataModel";

const JsonDB = require("croxydb/adapters/jsondb");
const CroxyDatabase = require("croxydb");

export default class CroxyDB implements Database {
  private db: any;

  constructor(name: string) {
    this.db = new CroxyDatabase(JsonDB, {
      dbName: name,
      dbFolder: `data/croxydb`,
      noBlankData: true,
      readable: true,
    });
  }

  /**
   * Formata as chaves para uso no banco de dados.
   * @param keys - As chaves a ser formatada.
   * @returns A chave formatada.
   */
  public formateKey(...keys: string[]): string {
    let key = keys.join("/").replace(/[/]/g, ".");

    if (key.startsWith(".")) {
      key = key.slice(1, key.length);
    }

    return key.trim();
  }

  public async get(key: string, id: string): Promise<DataModel> {
    const data = await this.db.get(this.formateKey(key, id));

    return DataModel.inject(new DataModel(), data, true);
  }

  public async save(key: string, data: DataModel, useDataId: boolean = true): Promise<void> {
    if (useDataId) {
      key = this.formateKey(key, data.id);
    } else {
      key = this.formateKey(key);
    }

    await this.db.set(key, data);
  }

  public async remove(key: string, id: string): Promise<void> {
    await this.db.set(this.formateKey(key, id), null);
  }

  public async findAll(key: string): Promise<DataModel[]> {
    const data = await this.db.get(this.formateKey(key));

    if (!data || data == null || typeof data != "object") return [];

    const items = Array.isArray(data) ? data : Object.keys(data).map((k) => data[k]);

    const list: DataModel[] = [];

    for (const item of items) {
      if (!item || item == null || typeof item != "object") continue;

      list.push(DataModel.inject(new DataModel(), item, true));
    }

    return list;
  }
}
