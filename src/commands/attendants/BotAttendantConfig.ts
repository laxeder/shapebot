import { CMDKey } from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import ClientError from "@modules/error/models/ClientError";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

import TextUtils from "@utils/TextUtils";

//! ===== Configurando comando =====

enum ConfigOption {
  AddAttendant = "Adicionar atendente",
  RemoveAttendant = "Remover atendente",
  ListAttendants = "Listar atendentes",
}

const CommandsOption: Record<ConfigOption, string> = {
  [ConfigOption.AddAttendant]: "add-bot-attendant",
  [ConfigOption.RemoveAttendant]: "remove-bot-attendant",
  [ConfigOption.ListAttendants]: "list-bot-attendants",
};

export const cmd = new Command(CommandDataUtils.generateEmpty({ options: Object.values(ConfigOption), option: "" }));

cmd.id = "bot-attendants-config";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("config", "atendente", "bot")];

//! ===== Etapa 1: Enviando opções de configuração disponíveis =====

cmd.addTask(async (data, next) => {
  const textUtils = new TextUtils(TextUtils.bold("Configuração dos atendentes"))
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
      await cmd.sendMessage("A configuração dos atendentes do bot foi fechada ✅");

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
      throw new ClientError(`Command "${data.option}" not found`, "Esse comando não está disponível no momento");
    }

    await cmd.sendMessage("Voltando para a configuração dos atendentes do bot...");

    return restart(0);
  })
);
