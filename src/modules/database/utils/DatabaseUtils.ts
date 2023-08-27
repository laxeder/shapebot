import Database from "../interfaces/Database";
import CroxyDB from "../models/CroxyDB";

export default class DatabaseUtils {
  public static getBotDatabase(): Database {
    return new CroxyDB();
  }

  public static getUserDatabase(): Database {
    return new CroxyDB();
  }
}
