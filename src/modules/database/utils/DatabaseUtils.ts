import { CroxyDBName } from "@modules/database/shared/CroxyDBName";
import Database from "@modules/database/interfaces/Database";
import CroxyDB from "@modules/database/models/CroxyDB";

export default class DatabaseUtils {
  public static getCommandDatabase(): Database {
    return new CroxyDB(CroxyDBName.Commands);
  }

  public static getBotDatabase(): Database {
    return new CroxyDB(CroxyDBName.Bot);
  }

  public static getUserDatabase(): Database {
    return new CroxyDB(CroxyDBName.User);
  }

  public static getWorkoutDatabase(): Database {
    return new CroxyDB(CroxyDBName.Workout);
  }
}
