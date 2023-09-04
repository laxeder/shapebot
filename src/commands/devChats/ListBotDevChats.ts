import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

import TextUtils from "@utils/TextUtils";

//! ===== Configurando comando =====

export const cmd = new Command(CommandDataUtils.generateEmpty({ devChats: [] as string[] }));

cmd.id = "list-bot-dev-chats";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("chats", "dev")];

//! ===== Etapa 1: Obtendo os chats de desenvolvedor do bot =====

cmd.addTask(async (data, next) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  const botData = await botController.getBotById(cmd.client.id);

  data.devChats = botData.devChats;

  if (data.devChats.length == 0) {
    await cmd.sendMessage("Nenhum chat de desenvolvedor foi adicionado no bot! ❌");

    return cmd.stopTasks();
  }

  return next(data);
});

//! ===== Etapa 2: Listando os chats de desenvolvedor do bot =====

cmd.addTask(async (data) => {
  const textUtils = new TextUtils(TextUtils.bold("Lista de chats de desenvolvedor"))
    .add(TextUtils.lineDecorator())
    .addLine(TextUtils.generateOptions(data.devChats))
    .addLine()
    .addLine(`Digite ${TextUtils.bold(`"configurar chats de dev do bot"`)} para configurar os chats de desenvolvedor do bot.`);

  await cmd.sendMessage(textUtils.getText());

  return cmd.stopTasks();
});

export default [cmd];
