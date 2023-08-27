import Client, { Command, WhatsAppBot } from "rompot";

import { getBaileysConfig } from "@configs/WAConfig";

import connection from "@events/connection";
import message from "@events/message";
import error from "@events/error";

import DataRepository from "@modules/database/interfaces/DataRepository";
import CommandController from "@modules/command/CommandController";
import { DataStatus } from "@modules/database/models/DataStatus";
import Database from "@modules/database/interfaces/Database";
import BotAuth from "@modules/bot/models/BotAuth";
import Bot from "@modules/bot/models/Bot";

export default class BotController {
  constructor(private repo: DataRepository<Bot>) {}

  public async createBot(bot: Bot): Promise<void> {
    await this.repo.create(bot);
  }

  public async updateBot(bot: Partial<Bot>): Promise<void> {
    await this.repo.update(bot);
  }

  public async getBotById(id: string): Promise<Bot> {
    const bot = await this.repo.read(new Bot({ id }));

    bot.id = id;

    if (!bot.admins.includes(bot.id)) {
      bot.admins.push(bot.id);
    }

    return bot;
  }

  public async listAllBots(): Promise<Bot[]> {
    const allBots = await this.repo.findAll();

    const bots: Bot[] = [];

    for (const bot of allBots) {
      if (bot.status != DataStatus.Enabled) continue;

      if (!bot.admins.includes(bot.id)) {
        bot.admins.push(bot.id);
      }

      bots.push(bot);
    }

    return bots;
  }

  public async deleteBotById(id: string): Promise<void> {
    await this.repo.delete(new Bot({ id }));
  }

  public async restoreBotById(id: string): Promise<void> {
    await this.repo.restore(new Bot({ id }));
  }

  public static async startBot(botId: string, db: Database) {
    //! ===== Configurando bot ===== !\\

    const client = new Client(new WhatsAppBot(getBaileysConfig()), {
      maxReconnectTimes: 100000,
      disableAutoCommand: true,
      disableAutoRead: true,
    });

    client.id = botId;

    //! ===== Configurando eventos ===== !\\

    client.on("conn", (update) => connection(client, update));
    client.on("message", (msg) => message(client, msg));
    client.on("error", (err) => error(client, err));

    //! ===== Configurando comandos ===== !\\

    const commandController = new CommandController();

    client.setCommandController(commandController);

    const commands = await Command.readCommands(`${__dirname}/../../../commands`);

    client.setCommands(commands);

    //! ===== Conectando bot ===== !\\

    const botAuth = new BotAuth(botId, db);

    await client.connect(botAuth);
  }
}
