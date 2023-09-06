import { IAuth } from "rompot";

import Database from "@modules/database/interfaces/Database";

import Logger from "@shared/Logger";

import { len } from "@utils/JSON";

export default class BotAuth implements IAuth {
  public botId: string;
  public logger: Logger;

  constructor(botId: string, private db: Database) {
    this.botId = botId;
    this.logger = new Logger(botId);
  }

  public genKey(botId?: string, authKey?: string): string {
    let key = `auths`;

    if (!!botId) key += `/${botId}`;
    if (!!authKey) key += `/${authKey.replace(/[/:]/g, ".")}`;

    return key;
  }

  public async get(key: string): Promise<any> {
    try {
      const data = await this.db.findAll(this.genKey(this.botId, key));

      if (!Array.isArray(data) && len(data) == 0) return null;

      return data;
    } catch (err) {
      this.logger.error(err, `Erro ao obter sessão (${this.botId}/${key})`);

      return null;
    }
  }

  public async set(key: string, data: any): Promise<void> {
    try {
      await this.db.save(this.genKey(this.botId, key), data);
    } catch (err) {
      this.logger.error(err, `Erro ao salvar sessão (${this.botId}:${key})`);
    }
  }

  public async remove(key: string): Promise<void> {
    try {
      await this.db.remove(this.genKey(this.botId), key);
    } catch (err) {
      this.logger.error(err, `Erro ao remover sessão (${this.botId}/${key})`);
    }
  }

  public async listAll(key?: string | undefined): Promise<string[]> {
    try {
      return Object.keys(await this.db.findAll(this.genKey(this.botId, key)));
    } catch (err) {
      this.logger.error(err, `Erro ao listar sessão (${this.botId}:${key})`);
    }

    return [];
  }
}
