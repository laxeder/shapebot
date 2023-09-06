import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

import TextUtils from "@utils/TextUtils";

//! ===== Configurando comando =====

export const cmd = new Command(CommandDataUtils.generateEmpty({ attendants: [] as string[] }));

cmd.id = "list-bot-attendants";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("attendants"), CMDKey("atendentes")];

//! ===== Etapa 1: Obtendo os atendentes do bot =====

cmd.addTask(async (data, next) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  const botData = await botController.getBotById(cmd.client.id);

  data.attendants = botData.attendants.filter((attendant) => attendant != cmd.client.id);

  if (data.attendants.length == 0) {
    await cmd.sendMessage("Nenhum atendente foi adicionado no bot! ❌");

    return cmd.stopTasks();
  }

  return next(data);
});

//! ===== Etapa 2: Listando atendentes =====

cmd.addTask(async (data) => {
  const textUtils = new TextUtils(TextUtils.bold("👤 Lista de atendentes"))
    .add(TextUtils.lineDecorator())
    .addLine(TextUtils.generateOptions(data.attendants))
    .addLine()
    .addLine(`Digite ${TextUtils.bold('"configurar atendentes"')} para configurar os atendentes do bot`);

  await cmd.sendMessage(textUtils.getText());

  return cmd.stopTasks();
});

export default [cmd];
