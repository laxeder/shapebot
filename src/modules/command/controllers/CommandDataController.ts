import { Message } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import { DataStatus } from "@modules/database/shared/DataStatus";
import CommandData from "@modules/command/models/CommandData";
import Database from "@modules/database/interfaces/Database";
import ClientError from "@modules/error/models/ClientError";

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

    const commandData = (await this.db.get(`/commands/${data.botId}/${data.id}/save`, data.chatId)) as T;

    const newData = this.readCommandData<T>(data, commandData);

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

    const datas = (await this.db.findAll(`/commands/${data.botId}/${data.id}/save`)) as CommandData[];

    for (const commandData of datas) {
      const newData = this.readCommandData(data, commandData);

      allChatsData.push(newData);
    }

    return allChatsData;
  }

  private readCommandData<T extends CommandData>(originalData: Partial<T>, commandData: T): T {
    const newData = CommandDataUtils.generateEmpty(commandData.isRunning ? { ...originalData, ...commandData } : originalData) as T;

    newData.lastMessage = injectJSON(newData.lastMessage, new Message("", ""));

    if (!newData.isRunning || newData.status != DataStatus.Enabled) {
      newData.updatedAt = DateUtils.ISO();
      newData.createdAt = DateUtils.ISO();
      newData.status = DataStatus.Enabled;
    }

    return newData;
  }
}
