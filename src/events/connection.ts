import Logger from "@shared/Logger";

import { IClient } from "rompot";

export default async (client: IClient, update: { action: string; status?: number; login?: any }) => {
  const logger = new Logger(client.id);

  if (update.action == "open") {
    logger.info(`Bot conectado! "${client.id || client.id}"`);
  }

  if (update.action == "close") {
    logger.warn(`Bot desligado! "${client.id || client.id}"`);
  }

  if (update.action == "stop") {
    logger.warn(`Conexão fechada! "${client.id || client.id}"`);
  }

  if (update.action == "reconnecting") {
    logger.warn(`Reconectando... "${client.id || client.id}"`);
  }
};
