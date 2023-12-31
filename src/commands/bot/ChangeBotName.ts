import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

//! ===== Configurando comando =====

export const cmd = new Command(CommandDataUtils.generateEmpty({ name: "" }));

cmd.id = "change-bot-name";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("alter", "nome", "bot"), CMDKey("defin", "nome", "bot")];

//! ===== Etapa 1: Inicialização =====

cmd.addTask(async (data, next) => {
  await cmd.sendMessage("Mande-me o novo nome do bot:");

  return next();
});

//! ===== Etapa 2: Obtendo novo nome =====

cmd.addTask(
  cmd.waitForText(async (data, name, next) => {
    if (name == null) {
      await cmd.sendMessage("A alteração do nome do bot foi cancelada! ❌");

      return cmd.stopTasks();
    }

    data.name = name;

    return next(data);
  })
);

//! ===== Etapa 3: Salvando novo nome =====

cmd.addTask(async (data) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  await botController.updateBot(cmd.client.id, { name: data.name });

  await cmd.sendMessage("O nome do bot foi alterado com sucesso! ✅");

  return cmd.stopTasks();
});
