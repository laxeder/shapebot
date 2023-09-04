import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";
import TextUtils from "@utils/TextUtils";

//! ===== Configurando comando =====

export const cmd = new Command(CommandDataUtils.generateEmpty({ admins: [] as string[], phonenumber: "" }));

cmd.id = "remove-bot-admin";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("remov", "admin")];

//! ===== Etapa 1: Obtendo os administradores do bot =====

cmd.addTask(async (data, next) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  const botData = await botController.getBotById(cmd.client.id);

  data.admins = botData.admins.filter((admin) => admin != cmd.client.id);

  if (data.admins.length == 0) {
    await cmd.sendMessage("Nenhum administrador foi adicionado no bot! ❌");

    return cmd.stopTasks();
  }

  return next(data);
});

//! ===== Etapa 2: Listando administradores para remoção =====

cmd.addTask(async (data, next) => {
  const textUtils = new TextUtils(TextUtils.bold("🔰 Lista de admins"))
    .add(TextUtils.lineDecorator())
    .addLine(TextUtils.generateOptions(data.admins))
    .addLine()
    .addLine("Digite o número do admin que voce deseja remover:");

  await cmd.sendMessage(textUtils.getText());

  return next(data);
});

//! ===== Etapa 3: Obtendo administrador escolhido =====

cmd.addTask(
  cmd.waitForOption(cmd.getDataValue("admins"), async (data, option, next) => {
    if (option == null) {
      await cmd.sendMessage("A remoção de um administrador do bot foi cancelada! ❌");

      return cmd.stopTasks();
    }

    data.phonenumber = data.admins[option];

    return next(data);
  })
);

//! ===== Etapa 4: Removendo o administrador =====

cmd.addTask(async (data) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  await botController.removeBotAdmins(cmd.clientId, String(data.phonenumber));

  await cmd.sendMessage("O administrador foi removido do bot com sucesso! ✅");

  return cmd.stopTasks();
});

export default [cmd];
