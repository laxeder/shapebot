import WorkoutRepository from "@modules/workout/database/WorkoutRepository";
import UserRepository from "@modules/user/database/UserRepository";
import BotRepository from "@modules/bot/database/BotRepository";
import DatabaseUtils from "@modules/database/utils/DatabaseUtils";

export default class RepositoryUtils {
  public static getBotRepository() {
    return new BotRepository(DatabaseUtils.getBotDatabase());
  }

  public static getUserDatabase() {
    return new UserRepository(DatabaseUtils.getUserDatabase());
  }

  public static getWorkoutRepository() {
    return new WorkoutRepository(DatabaseUtils.getWorkoutDatabase());
  }
}
