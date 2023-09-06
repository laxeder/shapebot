import { WorkoutCategory } from "@modules/workout/models/WorkoutCategory";
import DataRepository from "@modules/database/interfaces/DataRepository";
import { MuscleGroup } from "@modules/workout/models/MuscleGroup";
import { DataStatus } from "@modules/database/shared/DataStatus";
import Workout from "@modules/workout/models/Workout";

export default class WorkoutController {
  constructor(private repo: DataRepository<Workout>) {}

  /**
   * Cria um novo exercício.
   * @param workout - O exercício a ser criado.
   * @throws ClientError se o exercício já estiver habilitado.
   */
  public async createWorkout(workout: Workout): Promise<void> {
    await this.repo.create(workout);
  }

  /**
   * Atualiza um exercício existente.
   * @param id - Id do exercício que será atualizado.
   * @param workout - Os campos atualizados do exercício.
   * @throws ClientError se o exercício não estiver habilitado.
   */
  public async updateWorkout(id: string, workout: Partial<Workout>): Promise<void> {
    await this.repo.update({ ...workout, id });
  }

  /**
   * Adiciona novos membros musculares há um exercício existente.
   * @param id - Id do exercício que será atualizado.
   * @param muscles - Os novos músculos do exercício.
   * @throws ClientError se o exercício não estiver habilitado.
   */
  public async addWorkoutMuscles(id: string, ...muscles: MuscleGroup[]): Promise<void> {
    const workoutData = await this.repo.read(new Workout({ id }));

    const newMuscles: MuscleGroup[] = [...workoutData.muscles];

    for (const admin of muscles) {
      if (newMuscles.includes(admin)) continue;

      newMuscles.push(admin);
    }

    await this.repo.update({ muscles: newMuscles, id });
  }

  /**
   * Remove os músculos de um exercício existente.
   * @param id - Id do exercício que será atualizado.
   * @param muscles - Os músculos que serão removidos do exercício.
   * @throws ClientError se o exercício não estiver habilitado.
   */
  public async removeWorkoutMuscles(id: string, ...muscles: MuscleGroup[]): Promise<void> {
    const workoutData = await this.repo.read(new Workout({ id }));

    const newMuscles: MuscleGroup[] = workoutData.muscles.filter((muscle) => !muscles.includes(muscle));

    await this.repo.update({ muscles: newMuscles, id });
  }

  /**
   * Adiciona novas categorias há um exercício existente.
   * @param id - Id do exercício que será atualizado.
   * @param categories - As novas categorias do exercício.
   * @throws ClientError se o exercício não estiver habilitado.
   */
  public async addWorkoutCategories(id: string, ...categories: WorkoutCategory[]): Promise<void> {
    const workoutData = await this.repo.read(new Workout({ id }));

    const newCategories: WorkoutCategory[] = [...workoutData.categories];

    for (const category of categories) {
      if (newCategories.includes(category)) continue;

      newCategories.push(category);
    }

    await this.repo.update({ categories: newCategories, id });
  }

  /**
   * Remove as categorias de um exercício existente.
   * @param id - Id do exercício que será atualizado.
   * @param devChats - As categorias que serão removidas do exercício.
   * @throws ClientError se o exercício não estiver habilitado.
   */
  public async removeWorkoutCategories(id: string, ...categories: WorkoutCategory[]): Promise<void> {
    const workoutData = await this.repo.read(new Workout({ id }));

    const newCategories: WorkoutCategory[] = workoutData.categories.filter((category) => !categories.includes(category));

    await this.repo.update({ categories: newCategories, id });
  }

  /**
   * Obtém um exercício pelo seu ID
   * @param id - O ID do exercício a ser obtido.
   * @returns O exercício obtido.
   */
  public async getWorkoutById(id: string): Promise<Workout> {
    const workout = await this.repo.read(new Workout({ id }));

    return workout;
  }

  /**
   * Lista todos os exercícios habilitados
   * @returns Uma lista de exercícios habilitados.
   */
  public async listAllWorkouts(): Promise<Workout[]> {
    const allWorkouts = await this.repo.findAll();

    const enabledWorkouts: Workout[] = [];

    for (const workout of allWorkouts) {
      // Verifica se o workout está habilitado
      if (workout.status !== DataStatus.Enabled) continue;

      enabledWorkouts.push(workout);
    }

    return enabledWorkouts;
  }

  /**
   * Exclui um exercício pelo seu ID.
   * @param id - O ID do exercício a ser excluído.
   */
  public async deleteWorkoutById(id: string): Promise<void> {
    await this.repo.delete(new Workout({ id }));
  }

  /**
   * Restaura um exercício pelo seu ID.
   * @param id - O ID do exercício a ser restaurado.
   */
  public async restoreWorkoutById(id: string): Promise<void> {
    await this.repo.restore(new Workout({ id }));
  }
}
