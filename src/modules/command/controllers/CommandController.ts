import * as rompot from "rompot";

import CommandDataController from "@modules/command/controllers/CommandDataController";
import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import DatabaseUtils from "@modules/database/utils/DatabaseUtils";
import ObjectUtils from "@modules/object/utils/ObjectUtils";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";
import Logger from "@shared/Logger";

import FileUtils from "@utils/FileUtils";

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
    if (this.config.lowerCase) {
      text = text.toLowerCase();
    }

    let result: { key: rompot.ICommandKey; command: Command<any> } | null = null;

    for (const command of this.commands) {
      if (!(command instanceof Command)) continue;

      if (command.id == text) {
        result = { key: rompot.CMDKey(command.id), command };

        break;
      }

      for (const keys of command.keys) {
        if (result != null) {
          if (result.key.values.length > keys.values.length) continue;

          if (result.key.values.length == keys.values.length) {
            if (result.key.values.join("").length > keys.values.join("").length) continue;
          }
        }

        for (const index in keys.values) {
          const value = this.config.lowerCase ? keys.values[index].toLowerCase() : keys.values[index];

          if (!text.includes(value)) break;

          if (Number(index) != keys.values.length - 1) continue;

          result = { key: keys, command };
        }
      }
    }

    return result != null ? result.command : null;
  }

  public async runCommand(command: rompot.ICommand, message: rompot.IMessage): Promise<any> {
    if (!(command instanceof Command)) return false;

    const commandDataController = new CommandDataController(DatabaseUtils.getCommandDatabase());

    command.setSaveData(commandDataController.saveData.bind(commandDataController));
    command.setRestoreData(commandDataController.restoreData.bind(commandDataController));

    message.client = this.client;

    await command.onRead();

    const permission = await command.checkPerms(message);

    if (permission != null && !permission.isPermited) {
      this.emit("no-allowed", { message, command, permission });

      command.data.chatId = message.chat.id;

      command.data = await command.restoreData(command.data);

      command.initTask(await command.stopTasks());

      return false;
    }

    const cmd = ObjectUtils.inject(command, new Command(CommandDataUtils.generateEmpty({})), true);

    cmd.client = this.client;

    await this.execCommand(message, cmd);

    return true;
  }

  public async readCommands(dir: string): Promise<Command<any>[]> {
    const commands: Command<any>[] = [];

    await FileUtils.readRecursiveDir(dir, async (filepath, filename, ext) => {
      try {
        if (ext != ".ts" && ext != ".js") return;

        const content = require(filepath);

        if (!!!content) return;
        if (typeof content != "object") return;

        await Promise.all(
          Object.keys(content || {}).map(async (key) => {
            try {
              const cmd = content[key];

              if (!!!cmd) return;
              if (!rompot.isCommand(cmd)) return;
              if (!(cmd instanceof Command)) return;

              cmd.client = this.client;

              await cmd.onRead();

              commands.push(cmd);
            } catch (err) {
              const logger = new Logger(this.client.id);

              logger.error(err, "Verify command in path", `"${filepath}"`);
            }
          })
        );
      } catch (err) {
        const logger = new Logger(this.client.id);

        logger.error(err, "Verify commands in path", `"${filepath}"`);
      }
    });

    return commands;
  }
}
