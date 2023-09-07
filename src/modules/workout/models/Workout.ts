import { WorkoutCategory } from "@modules/workout/models/WorkoutCategory";
import { WorkoutType } from "@modules/workout/models/WorkoutType";
import { MuscleGroup } from "@modules/workout/models/MuscleGroup";
import DataModel from "@modules/database/models/DataModel";

export default class Workout extends DataModel {
  public botId: string = "";
  public name: string = "";
  public description: string = "";
  public muscles: MuscleGroup[] = [];
  public categories: WorkoutCategory[] = [];
  public type: WorkoutType = WorkoutType.Default;

  constructor(data: Partial<Workout> = {}) {
    super();

    DataModel.inject(this, data);
  }
}
