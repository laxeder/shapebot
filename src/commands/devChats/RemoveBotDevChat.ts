import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";
import TextUtils from "@utils/TextUtils";

//! ===== Configurando comando =====

export const cmd = new Command(CommandDataUtils.generateEmpty({ devChats: [] as string[], devChatId: "" }));

cmd.id = "remove-bot-dev-chat";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("remov", "dev", "chat")];

//! ===== Etapa 1: Obtendo os chats de desenvolvedor do bot =====

cmd.addTask(async (data, next) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  const botData = await botController.getBotById(cmd.client.id);

  data.devChats = botData.devChats;

  if (data.devChats.length == 0) {
    await cmd.sendMessage("Nenhum administrador foi adicionado no bot! ❌");

    return cmd.stopTasks();
  }

  return next(data);
});

//! ===== Etapa 2: Listando os chats de desenvolvedor para remoção =====

cmd.addTask(async (data, next) => {
  const textUtils = new TextUtils(TextUtils.bold("Lista dos chats de desenvolvedor"))
    .add(TextUtils.lineDecorator())
    .addLine(TextUtils.generateOptions(data.devChats))
    .addLine()
    .addLine("Digite o número do chat que voce deseja remover:");

  await cmd.sendMessage(textUtils.getText());

  return next(data);
});

//! ===== Etapa 3: Obtendo o chat de desenvolvedor escolhido =====

cmd.addTask(
  cmd.waitForOption(cmd.getDataValue("devChats"), async (data, option, next) => {
    if (option == null) {
      await cmd.sendMessage("A remoção de um chat de desenvolvedor do bot foi cancelada! ✅");

      return cmd.stopTasks();
    }

    data.devChatId = data.devChats[option];

    return next(data);
  })
);

//! ===== Etapa 4: Removendo o chat de desenvolvedor =====

cmd.addTask(async (data) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  await botController.removeBotDevChats(cmd.clientId, String(data.devChatId));

  await cmd.sendMessage("O chat de desenvolvedor foi removido do bot com sucesso! ✅");

  return cmd.stopTasks();
});

export default [cmd];
