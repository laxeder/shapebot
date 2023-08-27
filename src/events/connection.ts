import Logger from "@shared/Logger";

import { IClient } from "rompot";

export default async (client: IClient, update: { action: string; status?: number; login?: any }) => {
  try {
    if (update.action == "open") {
      Logger.info(`Bot conectado! "${client.id || client.id}"`);
    }

    if (update.action == "close") {
      Logger.warn(`Bot desligado! "${client.id || client.id}"`);
    }

    if (update.action == "stop") {
      Logger.warn(`Conexão fechada! "${client.id || client.id}"`);
    }

    if (update.action == "reconnecting") {
      Logger.warn(`Reconectando... "${client.id || client.id}"`);
    }
  } catch (err) {
    Logger.error(err, `Connection error`);
  }
};
