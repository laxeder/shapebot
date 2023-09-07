import { MultiFileAuthState } from "rompot";

import { getEnvironment } from "@configs/environments";

import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";

import Logger from "@shared/Logger";

async function start() {
  const logger = new Logger();

  logger.info(`Iniciando app...`);
  logger.info(`Ambiente: ${getEnvironment()}`);

  logger.info(`Iniciando bots...`);

  const botController = new BotController(RepositoryUtils.getBotRepository());

  const bots = await botController.listAllBots();

  for (const bot of bots) {
    try {
      const auth = new MultiFileAuthState(`./sessions/${bot.id}`);

      await BotController.startBot(bot.id, auth);
    } catch (err) {
      logger.error(err, `Erro ao iniciar bot "${bot.name || bot.id}"`);
    }
  }

  logger.info(`Bots iniciados!`);
}

start();
