import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

//! ===== Configurando comando =====

const cmd = new Command(CommandDataUtils.generateEmpty({ phonenumber: 0 }));

cmd.id = "add-bot-admin";
cmd.permissions = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("adicion", "admin")];

//! ===== Etapa 1: Inicialização =====

cmd.addTask(async (data, next) => {
  await cmd.sendMessage("Mande-me o número do novo administrador do bot:");

  return next();
});

//! ===== Etapa 2: Obtendo novo admin =====

cmd.addTask(
  cmd.waitForPhonenumber(async (data, phonenumber, next) => {
    if (phonenumber == null) {
      await cmd.sendMessage("A adição de um novo administrador ao bot foi cancelada! ❌");

      return cmd.stop();
    }

    data.phonenumber = phonenumber;

    return next(data);
  })
);

//! ===== Etapa 3: SAdicionando o novo admin =====

cmd.addTask(async (data) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  await botController.addBotAdmins(cmd.clientId, String(data.phonenumber));

  await cmd.sendMessage("Novo administrador adicionado ao bot com sucesso! ✅");

  return cmd.stop();
});

export default [cmd];
