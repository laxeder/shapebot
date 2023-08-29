import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

//! ===== Configurando comando =====

const data = CommandDataUtils.generateEmpty({ name: "" });
const cmd = new Command(data);

cmd.id = "change-bot-name";
cmd.permissions = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("alter", "nome", "bot"), CMDKey("defin", "nome", "bot")];

//! ===== Etapa 1: Inicialização =====

cmd.addTask(async (data, next) => {
  await cmd.client.sendMessage(cmd.chatId, "Mande-me o novo nome do bot:");

  return next();
});

//! ===== Etapa 2: Obtendo novo nome =====

cmd.addTask(
  cmd.waitForText(async (data, name, next, restart) => {
    data.name = name;

    return next(data);
  })
);

//! ===== Etapa 3: Salvando novo nome =====

cmd.addTask(async (data) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  await botController.updateBot({ id: cmd.clientId, name: data.name });

  await cmd.client.sendMessage(cmd.chatId, "O nome do bot foi alterado com sucesso! ✅");

  return cmd.stop();
});

export default [cmd];
