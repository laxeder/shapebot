import { Message } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import { DataStatus } from "@modules/database/shared/DataStatus";
import CommandData from "@modules/command/models/CommandData";
import Database from "@modules/database/interfaces/Database";
import ClientError from "@modules/error/models/ClientError";
import DataModel from "@modules/database/models/DataModel";

import { injectJSON } from "@utils/JSON";
import DateUtils from "@utils/Date";

export default class CommandDataController {
  constructor(private db: Database) {}

  /**
   * Salva os dados de um comando.
   * @param data - Dados do comando a ser salvo.
   * @throws ClientError se os campos necessários não estiverem definidos.
   */
  public async saveData(data: CommandData): Promise<void> {
    if (!data.id) {
      throw new ClientError("Command id not declared", "Não foi possível salvar os dados do comando");
    }

    if (!data.botId) {
      throw new ClientError("Command bot id not declared", "Não foi possível salvar os dados do comando");
    }

    if (!data.chatId) {
      throw new ClientError("Command chat id not declared", "Não foi possível salvar os dados do comando");
    }

    data.updatedAt = DateUtils.ISO();

    await this.db.save(`/commands/${data.botId}/${data.id}/save/${data.chatId}`, data, false);
  }

  /**
   * Restaura os dados de um comando salvo.
   * @param data - Os dados do comando que serão restaurados.
   * @throws ClientError se os campos necessários não estiverem definidos.
   */
  public async restoreData<T extends CommandData>(data: Partial<T>): Promise<T> {
    if (!data.id) {
      throw new ClientError("Command id not declared", "Não foi possível salvar os dados do comando");
    }

    if (!data.botId) {
      throw new ClientError("Command bot id not declared", "Não foi possível salvar os dados do comando");
    }

    if (!data.chatId) {
      throw new ClientError("Command chat id not declared", "Não foi possível salvar os dados do comando");
    }

    const commandData = await this.db.get(`/commands/${data.botId}/${data.id}/save`, data.chatId);

    const newData = DataModel.inject(CommandDataUtils.generateEmpty(data), commandData, true) as T;

    newData.id = data.id;
    newData.botId = data.botId;
    newData.chatId = data.chatId;
    newData.status = DataStatus.Enabled;
    newData.createdAt = DateUtils.ISO();
    newData.updatedAt = DateUtils.ISO();
    newData.lastMessage = injectJSON(newData.lastMessage, new Message("", ""));

    return newData;
  }

  /**
   * Lista os dados de todos os comandos salvos.
   * @param data - Os dados do comando que serão listados.
   * @throws ClientError se os campos necessários não estiverem definidos.
   */
  public async listAllChatsData(data: Partial<CommandData>): Promise<CommandData[]> {
    if (!data.id) {
      throw new ClientError("Command id not declared", "Não foi possível salvar os dados do comando");
    }

    if (!data.botId) {
      throw new ClientError("Command bot id not declared", "Não foi possível salvar os dados do comando");
    }

    const allChatsData: CommandData[] = [];

    const datas = await this.db.findAll(`/commands/${data.botId}/${data.id}/save`);

    for (const commandData of datas) {
      const newData = DataModel.inject(CommandDataUtils.generateEmpty(data), commandData, true);

      allChatsData.push(newData);
    }

    return allChatsData;
  }
}
