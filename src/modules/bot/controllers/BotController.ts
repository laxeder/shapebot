import Client, { Command, IAuth, WhatsAppBot } from "rompot";

import { getBaileysConfig } from "@configs/WAConfig";

import connection from "@events/connection";
import message from "@events/message";
import error from "@events/error";

import DataRepository from "@modules/database/interfaces/DataRepository";
import CommandController from "@modules/command/CommandController";
import { DataStatus } from "@modules/database/shared/DataStatus";
import Bot from "@modules/bot/models/Bot";

export default class BotController {
  constructor(private repo: DataRepository<Bot>) {}

  /**
   * Cria um novo bot.
   * @param bot - O bot a ser criado.
   * @throws ClientError se o bot já estiver habilitado.
   */
  public async createBot(bot: Bot): Promise<void> {
    await this.repo.create(bot);
  }

  /**
   * Atualiza um bot existente.
   * @param bot - Os campos atualizados do bot.
   * @throws ClientError se o bot não estiver habilitado.
   */
  public async updateBot(bot: Partial<Bot>): Promise<void> {
    await this.repo.update(bot);
  }

  /**
   * Obtém um bot pelo seu ID
   * @param id - O ID do bot a ser obtido.
   * @returns O bot obtido.
   */
  public async getBotById(id: string): Promise<Bot> {
    const bot = await this.repo.read(new Bot({ id }));

    // Adiciona o ID do bot acaso dados chegem vazios
    bot.id = id;

    // Adiciona o ID do bot à lista de administradores, se ainda não estiver presente
    if (!bot.admins.includes(bot.id)) {
      bot.admins.push(bot.id);
    }

    return bot;
  }

  /**
   * Lista todos os bots habilitados
   * @returns Uma lista de bots habilitados.
   */
  public async listAllBots(): Promise<Bot[]> {
    const allBots = await this.repo.findAll();

    const enabledBots: Bot[] = [];

    for (const bot of allBots) {
      // Verifica se o bot está habilitado
      if (bot.status !== DataStatus.Enabled) continue;

      // Adiciona o ID do bot à lista de administradores, se necessário
      if (!bot.admins.includes(bot.id)) {
        bot.admins.push(bot.id);
      }

      enabledBots.push(bot);
    }

    return enabledBots;
  }

  /**
   * Exclui um bot pelo seu ID.
   * @param id - O ID do bot a ser excluído.
   */
  public async deleteBotById(id: string): Promise<void> {
    await this.repo.delete(new Bot({ id }));
  }

  /**
   * Restaura um bot pelo seu ID.
   * @param id - O ID do bot a ser restaurado.
   */
  public async restoreBotById(id: string): Promise<void> {
    await this.repo.restore(new Bot({ id }));
  }

  /**
   * Inicia um bot.
   * @param botId - O ID do bot a ser iniciado.
   * @param auth - Método de auntenticação do bot.
   */
  public static async startBot(botId: string, auth: IAuth) {
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

    await client.connect(auth);
  }
}
