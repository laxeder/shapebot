import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

import TextUtils from "@utils/TextUtils";

//! ===== Configurando comando =====

export const cmd = new Command(CommandDataUtils.generateEmpty({ admins: [] as string[] }));

cmd.id = "list-bot-admins";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("admins"), CMDKey("administradores")];

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

//! ===== Etapa 2: Listando administradores =====

cmd.addTask(async (data) => {
  const textUtils = new TextUtils(TextUtils.bold("🔰 Lista de admins"))
    .add(TextUtils.lineDecorator())
    .addLine(TextUtils.generateOptions(data.admins))
    .addLine()
    .addLine(`Digite ${TextUtils.bold('"configurar administradores"')} para configurar os administradores do bot`);

  await cmd.sendMessage(textUtils.getText());

  return cmd.stopTasks();
});

export default [cmd];
