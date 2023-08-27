import DataRepository from "@modules/database/interfaces/DataRepository";
import { DataStatus } from "@modules/database/models/DataStatus";
import Database from "@modules/database/interfaces/Database";
import DataModel from "@modules/database/models/DataModel";
import ClientError from "@modules/error/models/ClientError";
import Bot from "@modules/bot/models/Bot";

import DateUtils from "@utils/Date";

export default class BotRepository implements DataRepository<Bot> {
  constructor(private db: Database) {}

  public async create(bot: Bot): Promise<void> {
    if (!bot.id) {
      throw new ClientError("Bot id not declared", "Não foi possível salvar os dados do bot");
    }

    const botData = await this.db.get("/bots", bot.id);

    if (botData.status == DataStatus.Enabled) {
      throw new ClientError(`bot "${bot.id}" already exists`, "Um bot com esse número já existe em nosso sistema");
    }

    bot.status = DataStatus.Enabled;
    bot.createdAt = DateUtils.ISO();
    bot.updatedAt = DateUtils.ISO();

    await this.db.save("/bots", bot);
  }

  public async update(bot: Partial<Bot>): Promise<void> {
    if (!bot.id) {
      throw new ClientError("Bot id not declared", "Não foi possível atualizar os dados do bot");
    }

    const data = await this.db.get("/bots", bot.id);

    if (data.status != DataStatus.Enabled) {
      throw new ClientError(`Not allowed to update bot "${bot.id}"`, "Não foi possível atualizar os dados do bot");
    }

    DataModel.inject(data, bot);

    data.updatedAt = DateUtils.ISO();

    await this.db.save("/bots", data);
  }

  public async read(bot: Bot): Promise<Bot> {
    if (!bot.id) {
      throw new ClientError("Bot id not declared", "Não foi possível ler os dados do bot");
    }

    const data = await this.db.get("/bots", bot.id);

    return new Bot(data);
  }

  public async delete(bot: Bot): Promise<void> {
    const data = await this.read(bot);

    if (data.status != DataStatus.Enabled) {
      throw new ClientError(`Bot "${bot.id}" has already been deleted`, "Os dados do bot já foram deletados");
    }

    data.status = DataStatus.Disabled;
    data.updatedAt = DateUtils.ISO();

    await this.db.save("/bots", data);
  }

  public async restore(bot: Bot): Promise<void> {
    const data = await this.read(bot);

    if (data.status != DataStatus.Disabled) {
      throw new ClientError(`Bot "${bot.id}" has already been restored`, "Os dados do bot já foram restaurados");
    }

    data.status = DataStatus.Enabled;
    data.updatedAt = DateUtils.ISO();

    await this.db.save("/bots", data);
  }

  public async findAll(): Promise<Bot[]> {
    const list = await this.db.findAll("/bots");

    return list.map((data) => new Bot(data));
  }
}
