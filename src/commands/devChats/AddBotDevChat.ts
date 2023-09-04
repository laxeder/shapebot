import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

//! ===== Configurando comando =====

export const cmd = new Command(CommandDataUtils.generateEmpty({ devChatId: "" }));

cmd.id = "add-bot-dev-chat";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("adicion", "dev", "chat", "bot")];

//! ===== Etapa 1: Inicialização =====

cmd.addTask(async (data, next) => {
  await cmd.sendMessage("Mande-me o ID do chat que voce deseja adicionar como desenvolvedor:");

  return next();
});

//! ===== Etapa 2: Obtendo ID do chat de desenvolvedor =====

cmd.addTask(
  cmd.waitForText(async (data, text, next) => {
    if (text == null) {
      await cmd.sendMessage("A adição de um novo chat de desenvolvedor ao bot foi cancelada! ✅");

      return cmd.stopTasks();
    }

    const botController = new BotController(RepositoryUtils.getBotRepository());

    const botData = await botController.getBotById(cmd.client.id);

    if (botData.devChats.includes(String(text))) {
      await cmd.sendMessage("Esse chat já faz parte dos chats de desenvolvedor do bot! ❌");

      return cmd.stopTasks();
    }

    data.devChatId = text;

    return next(data);
  })
);

//! ===== Etapa 3: Adicionando um novo chat de desenvolvedor no bot =====

cmd.addTask(async (data) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  await botController.addBotDevChats(cmd.clientId, String(data.devChatId));

  await cmd.sendMessage("Novo chat de desenvolvedor foi adicionado no bot com sucesso! ✅");

  return cmd.stopTasks();
});
