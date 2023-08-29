import * as rompot from "rompot";

import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

export default class CommandController extends rompot.CommandController {
  constructor(config: Partial<rompot.ICommandControllerConfig> = {}) {
    super(config);

    this.config.lowerCase = true;

    this.on("no-allowed", async ({ message, command, permission }) => {
      if (permission.id == Requeriments.BotAdmin) {
        //? Não manda mensagem de permissão negada para usuáriou
        // await message.reply("*Você não tem permissão para executar esse comando!*");
      }

      if (permission.id == Requeriments.ChatAdmin) {
        await message.reply("*Eu não sou admin do grupo, então não posso executar esse comando!*");
      }

      if (permission.id == Requeriments.UserAdmin) {
        await message.reply("*Você precisa ser um admin do grupo para executar esse comando!*");
      }
    });
  }

  public searchCommand(text: string): Command<any> | null {
    const commands: { key: rompot.ICommandKey; command: rompot.ICommand }[] = [];

    for (const command of this.commands) {
      if (command instanceof Command && command.id == text) {
        commands.push({ key: rompot.CMDKey(command.id), command });

        continue;
      }

      let resKey: null | rompot.ICommandKey = null;

      for (const keys of command.keys) {
        if (resKey != null && resKey.values.join("").length > keys.values.join("").length) continue;

        for (const index in keys.values) {
          if (!text.includes(keys.values[index])) break;

          if (Number(index) != keys.values.length - 1) continue;

          resKey = keys;
        }
      }

      if (resKey == null) continue;

      commands.push({ key: resKey, command });
    }

    let commandResult: { key: rompot.ICommandKey; command: rompot.ICommand } | null = null;

    for (const { key, command } of commands) {
      if (commandResult == null) {
        commandResult = { key, command };
        continue;
      }

      if (key.values.join("").length > commandResult.key.values.join("").length) {
        commandResult = { key, command };
      }
    }

    if (commandResult == null || !(commandResult.command instanceof Command)) {
      return null;
    }

    commandResult.command.saveData = async (data) => {
      //TODO: implementar salvamento
    };

    return commandResult.command;
  }

  public async runCommand(command: rompot.ICommand, message: rompot.IMessage, type?: string | undefined): Promise<any> {
    const permission = await command.checkPerms(message);

    if (permission != null && !permission.isPermited) {
      this.emit("no-allowed", { message, command, permission });

      return false;
    }

    if (type == rompot.CMDRunType.Reply) {
      await this.replyCommand(message, command);

      return true;
    }

    await this.execCommand(message, command);

    return true;
  }
}