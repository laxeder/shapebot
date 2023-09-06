import DataRepository from "@modules/database/interfaces/DataRepository";
import { DataStatus } from "@modules/database/shared/DataStatus";
import Database from "@modules/database/interfaces/Database";
import DataModel from "@modules/database/models/DataModel";
import ClientError from "@modules/error/models/ClientError";
import User from "@modules/user/models/User";

import DateUtils from "@utils/DateUtils";

export default class UserRepository implements DataRepository<User> {
  constructor(private db: Database) {}

  /**
   * Cria um novo usuário.
   * @param user - O usuário a ser criado.
   * @throws ClientError se o ID do usuário não estiver definido ou se um usuário com o mesmo ID já existir.
   */
  public async create(user: User): Promise<void> {
    if (!user.id) {
      throw new ClientError("User id not declared", "Não foi possível salvar os dados do usuário");
    }

    if (!user.botId) {
      throw new ClientError("User bot id not declared", "Não foi possível salvar os dados do usuário");
    }

    const userData = await this.read(new User(user));

    if (userData.status == DataStatus.Enabled) {
      throw new ClientError(`User "${user.botId} - ${user.id}" already exists`, "Um usuário com esse ID já existe em nosso sistema");
    }

    user.status = DataStatus.Enabled;
    user.createdAt = DateUtils.ISO();
    user.updatedAt = DateUtils.ISO();

    await this.db.save(`/users/${user.botId}`, user);
  }

  /**
   * Atualiza os dados de um usuário existente.
   * @param user - Os campos atualizados do usuário.
   * @throws ClientError se o ID do usuário não estiver definido ou se o usuário não estiver habilitado.
   */
  public async update(user: Partial<User>): Promise<void> {
    if (!user.id) {
      throw new ClientError("User id not declared", "Não foi possível atualizar os dados do usuário");
    }

    if (!user.botId) {
      throw new ClientError("User bot id not declared", "Não foi possível atualizar os dados do usuário");
    }

    const userData = await this.read(new User(user));

    if (userData.status != DataStatus.Enabled) {
      throw new ClientError(`Not allowed to update user "${user.botId} - ${user.id}"`, "Não foi possível atualizar os dados do usuário");
    }

    DataModel.inject(userData, user);

    userData.updatedAt = DateUtils.ISO();

    await this.db.save(`/users/${user.botId}`, userData);
  }

  /**
   * Lê os dados de um usuário.
   * @param user - O usuário cujos dados serão lidos.
   * @returns O usuário lido.
   * @throws ClientError se o ID do usuário não estiver definido
   */
  public async read(user: User): Promise<User> {
    if (!user.id) {
      throw new ClientError("User id not declared", "Não foi possível ler os dados do usuário");
    }

    if (!user.botId) {
      throw new ClientError("User bot id not declared", "Não foi possível ler os dados do usuário");
    }

    const userData = await this.db.get(`/users/${user.botId}`, user.id);

    return new User(userData);
  }

  /**
   * Exclui um usuário.
   * @param user - O usuário a ser excluído.
   * @throws ClientError se o usuário não estiver habilitado ou em caso de erro.
   */
  public async delete(user: User): Promise<void> {
    const userData = await this.read(user);

    if (userData.status != DataStatus.Enabled) {
      throw new ClientError(`User "${user.botId} - ${user.id}" has already been deleted`, "Os dados do usuário já foram deletados");
    }

    userData.status = DataStatus.Disabled;
    userData.updatedAt = DateUtils.ISO();

    await this.db.save(`/users/${userData.botId}`, userData);
  }

  /**
   * Restaura um usuário previamente excluído.
   * @param user - O usuário a ser restaurado.
   * @throws ClientError se o usuário não estiver desabilitado ou em caso de erro.
   */
  public async restore(user: User): Promise<void> {
    const userData = await this.read(user);

    if (userData.status != DataStatus.Disabled) {
      throw new ClientError(`User "${user.botId} - ${user.id}" has already been restored`, "Os dados do usuário já foram restaurados");
    }

    userData.status = DataStatus.Enabled;
    userData.updatedAt = DateUtils.ISO();

    await this.db.save(`/users/${userData.botId}`, userData);
  }

  /**
   * Obtém uma lista de todos os usuários habilitados.
   * @param botId - O ID do bot que contem o usuário.
   * @returns Uma lista de usuários habilitados.
   */
  public async findAll(botId: string): Promise<User[]> {
    const list = await this.db.findAll(`/users/${botId}`);

    return list.map((data) => new User(data));
  }
}
