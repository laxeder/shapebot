import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import ClientError from "@modules/error/models/ClientError";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

import TextUtils from "@utils/TextUtils";

//! ===== Configurando comando =====

enum ConfigOption {
  AddDevChat = "Adicionar chat",
  RemoveDevChat = "Remover chat",
  ListDevChats = "Listar chats",
}

const CommandsOption: Record<ConfigOption, string> = {
  [ConfigOption.AddDevChat]: "add-bot-dev-chat",
  [ConfigOption.RemoveDevChat]: "remove-bot-dev-chat",
  [ConfigOption.ListDevChats]: "list-bot-dev-chats",
};

export const cmd = new Command(CommandDataUtils.generateEmpty({ options: Object.values(ConfigOption), option: "" }));

cmd.id = "bot-dev-chats-config";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("config", "dev", "chat", "bot")];

//! ===== Etapa 1: Enviando opções de configuração disponíveis =====

cmd.addTask(async (data, next) => {
  const textUtils = new TextUtils(TextUtils.bold("Configuração dos chats de desenvolvedor"))
    .add(TextUtils.lineDecorator())
    .addLine(TextUtils.generateOptions(data.options))
    .addLine()
    .addLine(`Digite a opção que voce deseja ou *sair*:`);

  await cmd.sendMessage(textUtils.getText());

  return next(data);
});

//! ===== Etapa 2: Obtendo opção escolhida =====

cmd.addTask(
  cmd.waitForOption(cmd.getDataValue("options"), async (data, option, next) => {
    if (option == null) {
      await cmd.sendMessage("A configuração dos chats de desenvolvedor do bot foi fechada ✅");

      return cmd.stopTasks();
    }

    data.option = CommandsOption[data.options[option]];

    return next(data);
  })
);

//! ===== Etapa 3: Executando o comando da opção escolhida =====

cmd.addTask(
  cmd.runCommand(cmd.getDataValue("option"), async (data, isSearched, isExecuted, next, restart) => {
    if (!isSearched) {
      throw new ClientError(`Command "${data.option}" not found`, "Esse comando está indisponível no momento");
    }

    await cmd.sendMessage("Voltando para a configuração dos chats de desenvolvedor do bot...");

    return restart(0);
  })
);
