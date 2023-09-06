import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";
import TextUtils from "@utils/TextUtils";

//! ===== Configurando comando =====

export const cmd = new Command(CommandDataUtils.generateEmpty({ attendants: [] as string[], phonenumber: "" }));

cmd.id = "remove-bot-attendant";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("remov", "atendente")];

//! ===== Etapa 1: Obtendo os atendentes do bot =====

cmd.addTask(async (data, next) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  const botData = await botController.getBotById(cmd.client.id);

  data.attendants = botData.attendants.filter((admin) => admin != cmd.client.id);

  if (data.attendants.length == 0) {
    await cmd.sendMessage("Nenhum atendente foi adicionado no bot! ❌");

    return cmd.stopTasks();
  }

  return next(data);
});

//! ===== Etapa 2: Listando atendentes para remoção =====

cmd.addTask(async (data, next) => {
  const textUtils = new TextUtils(TextUtils.bold("👤 Lista de atendentes"))
    .add(TextUtils.lineDecorator())
    .addLine(TextUtils.generateOptions(data.attendants))
    .addLine()
    .addLine("Digite o número do atendente que voce deseja remover:");

  await cmd.sendMessage(textUtils.getText());

  return next(data);
});

//! ===== Etapa 3: Obtendo atendente escolhido =====

cmd.addTask(
  cmd.waitForOption(cmd.getDataValue("attendants"), async (data, option, next) => {
    if (option == null) {
      await cmd.sendMessage("A remoção de um atendente do bot foi cancelada! ❌");

      return cmd.stopTasks();
    }

    data.phonenumber = data.attendants[option];

    return next(data);
  })
);

//! ===== Etapa 4: Removendo o atendente =====

cmd.addTask(async (data) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  await botController.removeBotAttendants(cmd.clientId, String(data.phonenumber));

  await cmd.sendMessage("O atendente foi removido do bot com sucesso! ✅");

  return cmd.stopTasks();
});

export default [cmd];
