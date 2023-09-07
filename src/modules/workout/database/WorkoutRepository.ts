import DataRepository from "@modules/database/interfaces/DataRepository";
import { DataStatus } from "@modules/database/shared/DataStatus";
import Database from "@modules/database/interfaces/Database";
import DataModel from "@modules/database/models/DataModel";
import ClientError from "@modules/error/models/ClientError";
import Workout from "@modules/workout/models/Workout";

import DateUtils from "@utils/DateUtils";

export default class WorkoutRepository implements DataRepository<Workout> {
  constructor(private db: Database) {}

  /**
   * Cria um novo exercício.
   * @param workout - O exercício a ser criado.
   * @throws ClientError se o ID do exercício não estiver definido ou se um exercício com o mesmo ID já existir.
   */
  public async create(workout: Workout): Promise<void> {
    if (!workout.id) {
      throw new ClientError("Workout id not declared", "Não foi possível salvar os dados do exercício");
    }

    if (!workout.botId) {
      throw new ClientError("Workout bot id not declared", "Não foi possível salvar os dados do exercício");
    }

    const workoutData = await this.read(new Workout(workout));

    if (workoutData.status == DataStatus.Enabled) {
      throw new ClientError(`workout "${workout.botId} - ${workout.id}" already exists`, "Um exercício com esse número já existe em nosso sistema");
    }

    workout.status = DataStatus.Enabled;
    workout.createdAt = DateUtils.ISO();
    workout.updatedAt = DateUtils.ISO();

    await this.db.save(`/workouts/${workout.botId}`, workout);
  }

  /**
   * Atualiza os dados de um exercício existente.
   * @param workout - Os campos atualizados do exercício.
   * @throws ClientError se o ID do exercício não estiver definido ou se o exercício não estiver habilitado.
   */
  public async update(workout: Partial<Workout>): Promise<void> {
    if (!workout.id) {
      throw new ClientError("Workout id not declared", "Não foi possível atualizar os dados do exercício");
    }

    if (!workout.botId) {
      throw new ClientError("Workout bot id not declared", "Não foi possível atualizar os dados do exercício");
    }

    const workoutData = await this.read(new Workout(workout));

    if (workoutData.status != DataStatus.Enabled) {
      throw new ClientError(`Not allowed to update workout "${workout.botId} - ${workout.id}"`, "Não foi possível atualizar os dados do exercício");
    }

    DataModel.inject(workoutData, workout);

    workoutData.updatedAt = DateUtils.ISO();

    await this.db.save(`/workouts/${workoutData.botId}`, workoutData);
  }

  /**
   * Lê os dados de um exercício.
   * @param workout - O exercício cujos dados serão lidos.
   * @returns O exercício lido.
   * @throws ClientError se os campos necessários do exercício não estiverem preenchidos
   */
  public async read(workout: Workout): Promise<Workout> {
    if (!workout.id) {
      throw new ClientError("Workout id not declared", "Não foi possível ler os dados do exercício");
    }

    if (!workout.botId) {
      throw new ClientError("Workout bot id not declared", "Não foi possível ler os dados do exercício");
    }

    const workoutData = await this.db.get(`/workouts/${workout.botId}`, workout.id);

    return new Workout(workoutData);
  }

  /**
   * Exclui um exercício.
   * @param workout - O exercício a ser excluído.
   * @throws ClientError se o exercício não estiver habilitado ou em caso de erro.
   */
  public async delete(workout: Workout): Promise<void> {
    const workoutData = await this.read(workout);

    if (workoutData.status != DataStatus.Enabled) {
      throw new ClientError(`Workout "${workout.botId} - ${workout.id}" has already been deleted`, "Os dados do exercício já foram deletados");
    }

    workoutData.status = DataStatus.Disabled;
    workoutData.updatedAt = DateUtils.ISO();

    await this.db.save(`/workouts/${workoutData.botId}`, workoutData);
  }

  /**
   * Restaura um exercício previamente excluído.
   * @param workout - O exercício a ser restaurado.
   * @throws ClientError se o exercício não estiver desabilitado ou em caso de erro.
   */
  public async restore(workout: Workout): Promise<void> {
    const workoutData = await this.read(workout);

    if (workoutData.status != DataStatus.Disabled) {
      throw new ClientError(`Workout "${workout.botId} - ${workout.id}" has already been restored`, "Os dados do exercício já foram restaurados");
    }

    workoutData.status = DataStatus.Enabled;
    workoutData.updatedAt = DateUtils.ISO();

    await this.db.save(`/workouts/${workoutData.botId}`, workoutData);
  }

  /**
   * Obtém uma lista de todos os exercícios.
   * @param botId - Id do bot que contém o exercício.
   * @returns Uma lista de exercícios.
   */
  public async findAll(botId: string): Promise<Workout[]> {
    const list = await this.db.findAll(`/workouts/${botId}`);

    return list.map((workoutData) => new Workout(workoutData));
  }
}
