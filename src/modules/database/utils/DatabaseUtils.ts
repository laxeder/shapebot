import Database from "@modules/database/interfaces/Database";
import CroxyDB from "@modules/database/models/CroxyDB";

export default class DatabaseUtils {
  public static getCommandDatabase(): Database {
    return new CroxyDB();
  }

  public static getBotDatabase(): Database {
    return new CroxyDB();
  }

  public static getUserDatabase(): Database {
    return new CroxyDB();
  }
}
