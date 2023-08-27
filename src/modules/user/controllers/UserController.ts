import DataRepository from "@modules/database/interfaces/DataRepository";
import { DataStatus } from "@modules/database/shared/DataStatus";
import User from "@modules/user/models/User";

export default class UserController {
  constructor(private repo: DataRepository<User>) {}

  /**
   * Cria um novo usuário.
   * @param user - O usuário a ser criado.
   * @throws ClientError se o usuário já estiver habilitado.
   */
  public async createUser(user: User): Promise<void> {
    await this.repo.create(user);
  }

  /**
   * Atualiza um usuário existente.
   * @param user - Os campos atualizados do usuário.
   * @throws ClientError se o usuário não estiver habilitado.
   */
  public async updateUser(user: Partial<User>): Promise<void> {
    await this.repo.update(user);
  }

  /**
   * Obtém um usuário pelo seu ID
   * @param botId - O ID do bot que contem o usuário.
   * @param id - O ID do usuário a ser obtido.
   * @returns O usuário obtido.
   */
  public async getUserById(botId: string, id: string): Promise<User> {
    const user = await this.repo.read(new User({ botId, id }));

    // Adiciona o ID do usuário e do bot acaso dados chegem vazios
    user.botId = botId;
    user.id = id;

    return user;
  }

  /**
   * Lista todos os usuários habilitados
   * @param botId O ID do bot que contem todos os usuários.
   * @returns Uma lista de usuários habilitados.
   */
  public async listAllUsers(botId: string): Promise<User[]> {
    const allUsers = await this.repo.findAll(botId);

    const enabledUsers: User[] = [];

    for (const user of allUsers) {
      // Verifica se o usuário está habilitado
      if (user.status !== DataStatus.Enabled) continue;

      enabledUsers.push(user);
    }

    return enabledUsers;
  }

  /**
   * Exclui um usuário pelo seu ID.
   * @param botId - O ID do bot que contem o usuário.
   * @param id - O ID do usuário a ser excluído.
   */
  public async deleteUserById(botId: string, id: string): Promise<void> {
    await this.repo.delete(new User({ botId, id }));
  }

  /**
   * Restaura um usuário pelo seu ID.
   * @param botId - O ID do bot que contem o usuário.
   * @param id - O ID do usuário a ser restaurado.
   */
  public async restoreUserById(botId: string, id: string): Promise<void> {
    await this.repo.restore(new User({ botId, id }));
  }
}
