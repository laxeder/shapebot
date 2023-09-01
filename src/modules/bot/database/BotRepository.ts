import DataRepository from "@modules/database/interfaces/DataRepository";
import { DataStatus } from "@modules/database/shared/DataStatus";
import Database from "@modules/database/interfaces/Database";
import DataModel from "@modules/database/models/DataModel";
import ClientError from "@modules/error/models/ClientError";
import Bot from "@modules/bot/models/Bot";

import DateUtils from "@utils/Date";

export default class BotRepository implements DataRepository<Bot> {
  constructor(private db: Database) {}

  /**
   * Cria um novo bot.
   * @param bot - O bot a ser criado.
   * @throws ClientError se o ID do bot não estiver definido ou se um bot com o mesmo ID já existir.
   */
  public async create(bot: Bot): Promise<void> {
    const botData = await this.read(new Bot(bot));

    if (botData.status == DataStatus.Enabled) {
      throw new ClientError(`bot "${bot.id}" already exists`, "Um bot com esse número já existe em nosso sistema");
    }

    bot.status = DataStatus.Enabled;
    bot.createdAt = DateUtils.ISO();
    bot.updatedAt = DateUtils.ISO();

    await this.db.save("/bots", bot);
  }

  /**
   * Atualiza os dados de um bot existente.
   * @param bot - Os campos atualizados do bot.
   * @throws ClientError se o ID do bot não estiver definido ou se o bot não estiver habilitado.
   */
  public async update(bot: Partial<Bot>): Promise<void> {
    const botData = await this.read(new Bot(bot));

    if (botData.status != DataStatus.Enabled) {
      throw new ClientError(`Not allowed to update bot "${bot.id}"`, "Não foi possível atualizar os dados do bot");
    }

    DataModel.inject(botData, bot);

    botData.updatedAt = DateUtils.ISO();

    await this.db.save("/bots", botData);
  }

  /**
   * Lê os dados de um bot.
   * @param bot - O bot cujos dados serão lidos.
   * @returns O bot lido.
   * @throws ClientError se o ID do bot não estiver definido
   */
  public async read(bot: Bot): Promise<Bot> {
    if (!bot.id) {
      throw new ClientError("Bot id not declared", "Não foi possível ler os dados do bot");
    }

    const botData = await this.db.get("/bots", bot.id);

    return new Bot(botData);
  }

  /**
   * Exclui um bot.
   * @param bot - O bot a ser excluído.
   * @throws ClientError se o bot não estiver habilitado ou em caso de erro.
   */
  public async delete(bot: Bot): Promise<void> {
    const botData = await this.read(bot);

    if (botData.status != DataStatus.Enabled) {
      throw new ClientError(`Bot "${bot.id}" has already been deleted`, "Os dados do bot já foram deletados");
    }

    botData.status = DataStatus.Disabled;
    botData.updatedAt = DateUtils.ISO();

    await this.db.save("/bots", botData);
  }

  /**
   * Restaura um bot previamente excluído.
   * @param bot - O bot a ser restaurado.
   * @throws ClientError se o bot não estiver desabilitado ou em caso de erro.
   */
  public async restore(bot: Bot): Promise<void> {
    const botData = await this.read(bot);

    if (botData.status != DataStatus.Disabled) {
      throw new ClientError(`Bot "${bot.id}" has already been restored`, "Os dados do bot já foram restaurados");
    }

    botData.status = DataStatus.Enabled;
    botData.updatedAt = DateUtils.ISO();

    await this.db.save("/bots", botData);
  }

  /**
   * Obtém uma lista de todos os bots habilitados.
   * @returns Uma lista de bots habilitados.
   */
  public async findAll(): Promise<Bot[]> {
    const list = await this.db.findAll("/bots");

    return list.map((botData) => new Bot(botData));
  }
}
