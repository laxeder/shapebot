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
cmd.permissions = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("admins", "administradores")];

//! ===== Etapa 1: Obtendo os administradores do bot =====

cmd.addTask(async (data, next) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  const botData = await botController.getBotById(cmd.client.id);

  data.admins = botData.admins.filter((admin) => admin != cmd.client.id);

  if (data.admins.length == 0) {
    await cmd.client.sendMessage(cmd.chatId, "Nenhum administrador foi adicionado no bot! ❌");

    return cmd.stopTasks();
  }

  return next(data);
});

//! ===== Etapa 2: Listando administradores =====

cmd.addTask(async (data, next) => {
  const textUtils = new TextUtils(TextUtils.bold("🔰 Lista de admins"))
    .add(TextUtils.lineDecorator())
    .addLine(TextUtils.generateOptions(data.admins))
    .addLine()
    .addLine(`Digite ${TextUtils.bold("adicionar admin")} para adicionar um novo admin ou ${TextUtils.bold("remover admin")} para remover um admin existente`);

  await cmd.client.sendMessage(cmd.chatId, textUtils.getText());

  return next(data);
});

export default [cmd];
