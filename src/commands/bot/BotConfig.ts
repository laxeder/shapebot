import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import { DataStatus } from "@modules/database/shared/DataStatus";
import ClientError from "@modules/error/models/ClientError";
import Command from "@modules/command/models/Command";
import Bot from "@modules/bot/models/Bot";

import { Requeriments } from "@shared/Requeriments";

import TextUtils from "@utils/TextUtils";

//! ===== Configurando comando =====

enum ConfigOption {
  Name = "Alterar nome",
  Admins = "Configurar admins",
  DevChats = "Configurar chats de dev",
}

const CommandsOption: Record<ConfigOption, string> = {
  [ConfigOption.Name]: "change-bot-name",
  [ConfigOption.Admins]: "bot-admins-config",
  [ConfigOption.DevChats]: "bot-dev-chats-config",
};

export const cmd = new Command(CommandDataUtils.generateEmpty({ botData: new Bot({}), options: Object.values(ConfigOption), option: "" }));

cmd.id = "bot-config";
cmd.permissions = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("config", "bot"), CMDKey("dados", "bot")];

//! ===== Etapa 1: Obtendo dados do bot =====

cmd.addTask(async (data, next) => {
  const botController = new BotController(RepositoryUtils.getBotRepository());

  const botData = await botController.getBotById(data.botId);

  if (botData.status != DataStatus.Enabled) {
    throw new ClientError(`Bot "${data.botId}" not found`, "Não foi possível ler os dados do bot");
  }

  data.botData = botData;

  return next(data);
});

//! ===== Etapa 2: Enviando dados do bot e opções de configuração disponíveis =====

cmd.addTask(async (data, next) => {
  const textUtils = new TextUtils(TextUtils.bold("Configuração do bot"))
    .add(TextUtils.lineDecorator())
    .addLine(TextUtils.bold("Nome:"))
    .add(` ${data.botData.name}`)
    .addLine(TextUtils.bold("Criação:"))
    .add(` ${data.botData.createdAt}`)
    .add(TextUtils.lineDecorator())
    .addLine(TextUtils.generateOptions(data.options))
    .addLine()
    .addLine(`Digite a opção que voce deseja ou *sair*:`);

  await cmd.sendMessage(textUtils.getText());

  return next(data);
});

//! ===== Etapa 3: Obtendo opção escolhida =====

cmd.addTask(
  cmd.waitForOption(cmd.getDataValue("options"), async (data, option, next) => {
    if (option == null) {
      await cmd.sendMessage("A configuração do bot foi fechada ✅");

      return cmd.stopTasks();
    }

    data.option = CommandsOption[data.options[option]];

    return next(data);
  })
);

//! ===== Etapa 4: Executando o comando da opção escolhida =====

cmd.addTask(
  cmd.runCommand(cmd.getDataValue("option"), async (data, isSearched, isExecuted, next, restart) => {
    if (!isSearched) {
      throw new ClientError(`Command "${data.option}" not found`, "Esse comando está indisponível no momento");
    }

    await cmd.sendMessage("Voltando para a configuração do bot...");

    return restart(0);
  })
);
