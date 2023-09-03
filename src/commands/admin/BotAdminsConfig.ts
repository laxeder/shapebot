import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import ClientError from "@modules/error/models/ClientError";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

import TextUtils from "@utils/TextUtils";

//! ===== Configurando comando =====

enum ConfigOption {
  AddAdmin = "Adicionar admin",
  RemoveAdmin = "Remover admin",
  ListAdmins = "Listar admins",
}

const CommandsOption: Record<ConfigOption, string> = {
  [ConfigOption.AddAdmin]: "add-bot-admin",
  [ConfigOption.RemoveAdmin]: "remove-bot-admin",
  [ConfigOption.ListAdmins]: "list-bot-admins",
};

export const cmd = new Command(CommandDataUtils.generateEmpty({ options: Object.values(ConfigOption), option: "" }));

cmd.id = "bot-admins-config";
cmd.permissions = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("config", "admin", "bot")];

//! ===== Etapa 1: Enviando opções de configuração disponíveis =====

cmd.addTask(async (data, next) => {
  const textUtils = new TextUtils(TextUtils.bold("Configuração dos admins"))
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
      await cmd.sendMessage("A configuração dos administradores do bot foi fechada ✅");

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

    await cmd.sendMessage("Voltando para a configuração dos administradores do bot...");

    return restart(0);
  })
);
