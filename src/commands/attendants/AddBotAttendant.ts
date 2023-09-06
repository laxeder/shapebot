import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

//! ===== Configurando comando =====

export const cmd = new Command(CommandDataUtils.generateEmpty({ phonenumber: 0 }));

cmd.id = "add-bot-attendant";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("adicion", "atendente")];

//! ===== Etapa 1: Inicialização =====

cmd.addTask(async (data, next) => {
  await cmd.sendMessage("Mande-me o número do novo atendente do bot:");

  return next();
});

//! ===== Etapa 2: Obtendo novo atendente =====

cmd.addTask(
  cmd.waitForPhonenumber(async (data, phonenumber, next) => {
    if (phonenumber == null) {
      await cmd.sendMessage("A adição de um novo atendente no bot foi cancelada! ❌");

      return cmd.stopTasks();
    }

    const botController = new BotController(RepositoryUtils.getBotRepository());

    const botData = await botController.getBotById(cmd.client.id);

    if (botData.attendants.includes(String(phonenumber))) {
      await cmd.sendMessage("Esse número já é atendente do bot! ❌");

      return cmd.stopTasks();
    }

    data.phonenumber = phonenumber;

    return next(data);
  })
);

//! ===== Etapa 3: Adicionando o novo atendente =====

cmd.addTask(async (data) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  await botController.addBotAttendants(cmd.clientId, String(data.phonenumber));

  await cmd.sendMessage("Novo atendente adicionado no bot com sucesso! ✅");

  return cmd.stopTasks();
});
