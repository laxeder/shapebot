import { MultiFileAuthState } from "rompot";

import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import { getEnvironment } from "@configs/environments";

import Logger from "@shared/Logger";

async function start() {
  Logger.info(`Iniciando app...`);
  Logger.info(`Ambiente: ${getEnvironment()}`);

  Logger.info(`Iniciando bots...`);

  const botController = new BotController(RepositoryUtils.getBotRepository());

  const bots = await botController.listAllBots();

  for (const bot of bots) {
    try {
      const auth = new MultiFileAuthState(`./sessions/${bot.id}`);

      await BotController.startBot(bot.id, auth);
    } catch (err) {
      Logger.error(err, `Erro ao iniciar bot "${bot.name || bot.id}"`);
    }
  }

  Logger.info(`Bots iniciados!`);
}

start();
