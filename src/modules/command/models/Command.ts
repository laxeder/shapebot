import type { CommandAwaitable } from "@modules/command/types/CommandAwaitable";
import type { CommandRestart } from "@modules/command/types/CommandRestart";
import type { CommandNext } from "@modules/command/types/CommandNext";

import * as rompot from "rompot";

import CommandDataController from "@modules/command/controllers/CommandDataController";
import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import CommandDataKey from "@modules/command/models/CommandDataKey";
import DatabaseUtils from "@modules/database/utils/DatabaseUtils";
import CommandData from "@modules/command/models/CommandData";
import CommandTask from "@modules/command/models/CommandTask";
import ClientError from "@modules/error/models/ClientError";

import { Requeriments, checkRequeriments } from "@shared/Requeriments";
import Logger from "@shared/Logger";

import { injectJSON } from "@utils/JSON";
import TextUtils from "@utils/TextUtils";

export default class Command<T extends CommandData> extends rompot.Command {
  public id: string = "";
  public avaible: rompot.ChatType[] = ["pv"];
  public requeriments: Requeriments[] = [];
  public tasks: CommandTask<T>[] = [];
  public logger: Logger = new Logger("");
  public data: T;

  //? Implementado externamente
  public saveData: (data: T) => any = (data) => {
    this.data = data;
  };
  public restoreData: (data: T) => CommandAwaitable<T> = (data) => {
    return data;
  };

  public async emitError(error: any) {
    try {
      this.logger.error(error, `Command error "${this.id}" - [${this.data.currentTaskIndex}]: ${JSON.stringify(this.data)}`);

      if (error instanceof ClientError) {
        await this.sendMessage(`${error.message}! ❌`);
      } else if (this.data.currentTaskIndex == 0) {
        await this.sendMessage("Serviço indiponível no momento! Favor tente novamente mais tarde.");
      } else {
        await this.sendMessage("Um erro ocorreu durante o processamento da conversa. Favor tente executar o comando novamente, acaso persista no problema comunique com o suporte do bot.");
      }

      await this.stopTasks();
    } catch (err) {
      this.logger.error(err, "Command logger error", `"${this.id}"`);
    }
  }

  constructor(data: T, keys: rompot.CommandKey[] = []) {
    super();

    this.keys = keys;
    this.data = data;
  }

  public getDataValue(key: keyof T): CommandDataKey<T> {
    return new CommandDataKey<T>(key);
  }

  public setSaveData(fn: this["saveData"]): void {
    this.saveData = fn;
  }

  public setRestoreData(fn: this["restoreData"]): void {
    this.restoreData = fn;
  }

  public async onExec(message: rompot.IMessage): Promise<void> {
    this.logger.chatId = message.chat.id;

    await this.startTasks(message);
  }

  public async onRead() {
    this.data.id = this.id;
    this.data.botId = this.client.id;
    this.logger.botId = this.client.id;
  }

  public async onReply(message: rompot.IMessage) {
    await this.startTasks(message);
  }

  public async checkPerms(message: rompot.IMessage): Promise<rompot.ICommandPermission | null> {
    return await checkRequeriments(message, ...this.requeriments);
  }

  public addTask(fn: ((data: T, next: CommandNext<T>, restart: CommandRestart<T>) => CommandAwaitable<CommandTask<T>>) | CommandTask<T>): void {
    if (fn instanceof CommandTask) {
      this.tasks.push(fn);
    } else {
      const task = new CommandTask(this, "function");

      task.setFunction((command, data, next, restart) => {
        return fn(data, next, restart);
      });

      this.tasks.push(task);
    }
  }

  public getTask(index: number): CommandTask<T> {
    if (index >= this.tasks.length) return new CommandTask<T>(this, "void");

    return this.tasks[index] || new CommandTask<T>(this, "void");
  }

  public async startTasks(message: rompot.IMessage): Promise<void> {
    this.data.chatId = message.chat.id;

    const restore = await this.restoreData(this.data);

    if (restore.isRunning) {
      injectJSON(restore, this.data);
    } else {
      this.data.lastMessage = message;
      this.data.currentTaskIndex = 0;
      this.data.isRunning = true;

      await this.saveData(this.data);
    }

    this.data.lastMessage.client = this.client;
    this.data.lastMessage.clientId = this.client.id;

    await this.initTask(this.getTask(this.data.currentTaskIndex));
  }

  public async initTask(task: CommandTask<T>): Promise<void> {
    try {
      if (task.type == "void") return;

      if (task.type == "stop") {
        await this.stopTasks();
      }

      if (task.type == "function") {
        const fn = await task.execFunction(this.data, this.nextTask.bind(this), this.restartTask.bind(this));

        await this.initTask(fn);
      }
    } catch (err) {
      this.emitError(err);
    }
  }

  public async nextTask(data: T = this.data, index: number = this.data.currentTaskIndex + 1): Promise<CommandTask<T>> {
    this.data = data;
    this.data.currentTaskIndex = index;

    await this.saveData(this.data);

    return this.getTask(index);
  }

  public async restartTask(index: number = this.data.currentTaskIndex): Promise<CommandTask<T>> {
    this.data.currentTaskIndex = index;

    await this.saveData(this.data);

    return this.getTask(index);
  }

  public async stopTasks(): Promise<CommandTask<T>> {
    if (this.data.isRunning) {
      this.data.isRunning = false;

      await this.saveData(this.data);
    }

    return new CommandTask<T>(this, "stop");
  }

  public async sendMessage(message: string | rompot.IMessage): Promise<rompot.IMessage> {
    if (typeof message != "string" && rompot.isMessage(message)) {
      if (!message.chat.id) message.chat.id = this.data.chatId;

      return await this.client.send(message);
    } else {
      return await this.client.sendMessage(this.data.lastMessage.chat, message);
    }
  }

  public runCommand<C extends CommandData>(
    commandId: string | CommandDataKey<T>,
    fn: (data: T, isSearched: boolean, isExecuted: boolean, next: CommandNext<T>, restart: CommandRestart<T>) => CommandAwaitable<CommandTask<T>>
  ): CommandTask<T> {
    const task = new CommandTask(this, "function");

    task.setFunction(async (command, data, next, restart) => {
      const cmdId = CommandDataUtils.getValue<T, string>(data, commandId);

      const runCMD = command.client.searchCommand(cmdId);

      if (runCMD == null || !(runCMD instanceof Command)) {
        return await fn(data, false, false, next, restart);
      }

      const permission = await runCMD.checkPerms(data.lastMessage);

      if (permission != null && !permission.isPermited) {
        command.client.commandController.emit("no-allowed", { message: data.lastMessage, command: runCMD, permission });

        return await fn(data, true, false, next, restart);
      }

      await command.onRead();

      const commandDataController = new CommandDataController(DatabaseUtils.getCommandDatabase());

      runCMD.setSaveData(commandDataController.saveData.bind(commandDataController));
      runCMD.setRestoreData(commandDataController.restoreData.bind(commandDataController)<C>);

      const cmdData = injectJSON(runCMD, new Command(CommandDataUtils.generateEmpty({})), true);

      cmdData.client = task.command.client;
      cmdData.clientId = task.command.clientId;
      cmdData.data.chatId = task.command.data.chatId;

      const restore = await cmdData.restoreData(cmdData.data);

      if (!restore.isRunning) {
        cmdData.data = injectJSON(restore, cmdData.data);
      }

      cmdData.data.isHead = false;
      cmdData.data.lastMessage = data.lastMessage;
      cmdData.data.lastMessage.client = task.command.client;
      cmdData.data.lastMessage.clientId = task.command.clientId;

      await cmdData.saveData(cmdData.data);

      await command.client.commandController.execCommand(cmdData.data.lastMessage, cmdData);

      return await fn(data, true, true, next, restart);
    });

    return task;
  }

  public waitForMessage(fn: (data: T, message: rompot.IMessage, next: CommandNext<T>, restart: CommandRestart<T>) => CommandAwaitable<CommandTask<T>>): CommandTask<T> {
    const task = new CommandTask(this, "function");

    task.setFunction(async (command, data, next, restart) => {
      const waitForMessageConfig = { stopRead: true, ignoreMessageFromMe: false };

      const lastMessage = await command.client.awaitMessage(data.chatId, waitForMessageConfig);

      if (lastMessage.apiSend) return task.execFunction(data, next, restart);

      await lastMessage.read();

      data.lastMessage = lastMessage;

      await this.saveData(data);

      return await fn(data, lastMessage, next, restart);
    });

    return task;
  }

  public waitForText(fn: (data: T, text: string | null, next: CommandNext<T>, restart: CommandRestart<T>) => CommandAwaitable<CommandTask<T>>): CommandTask<T> {
    const task = this.waitForMessage(async (data, message, next, restart) => {
      if (!message.text) {
        await task.command.sendMessage("Favor digite um texto válido:");

        return task.execFunction(data, next, restart);
      }

      if (TextUtils.isCanceled(message.text)) {
        return await fn(data, null, next, restart);
      }

      return await fn(data, message.text, next, restart);
    });

    return task;
  }

  public waitForNumber(fn: (data: T, number: number | null, next: CommandNext<T>, restart: CommandRestart<T>) => CommandAwaitable<CommandTask<T>>, allNumbers: boolean = false): CommandTask<T> {
    const task = this.waitForText(async (data, text, next, restart) => {
      if (text == null) {
        return await fn(data, null, next, restart);
      }

      const num = Number(text.replace(/\D+/g, ""));

      if (Number.isNaN(num)) {
        await task.command.sendMessage("Favor digite um número válido:");

        return task.execFunction(data, next, restart);
      }

      if (allNumbers && num < 0) {
        await task.command.sendMessage("Favor digite um número maior que zero:");

        return task.execFunction(data, next, restart);
      }

      return await fn(data, num, next, restart);
    });

    return task;
  }

  public waitForPhonenumber(fn: (data: T, phonenumber: number | null, next: CommandNext<T>, restart: CommandRestart<T>) => CommandAwaitable<CommandTask<T>>): CommandTask<T> {
    const task = this.waitForNumber(async (data, num, next, restart) => {
      if (num == null) {
        return await fn(data, null, next, restart);
      }

      if (String(num).length < 8 || String(num).length > 15) {
        await task.command.sendMessage("Favor digite um número no formato internacional (Ex: +55 15 12345-9999):");

        return task.execFunction(data, next, restart);
      }

      return await fn(data, num, next, restart);
    });

    return task;
  }

  public waitForOption(
    options: Array<any> | CommandDataKey<T>,
    fn: (data: T, option: number | null, next: CommandNext<T>, restart: CommandRestart<T>) => CommandAwaitable<CommandTask<T>>
  ): CommandTask<T> {
    const task = this.waitForText(async (data, text, next, restart) => {
      if (text == null) {
        return await fn(data, null, next, restart);
      }

      const opts = CommandDataUtils.getValue<T, any[]>(data, options);

      const result = opts.filter((opt) => text.toLowerCase().includes(String(opt).toLowerCase()));

      if (result.length > 0) {
        let index = 0;

        for (const i in result) {
          if (String(result[i]).length <= String(result[index]).length) continue;

          index = Number(i);
        }

        return await fn(data, result[index], next, restart);
      }

      const option = Number(text.replace(/\D+/g, ""));

      if (Number.isNaN(option) || option < 1 || option > opts.length) {
        await task.command.sendMessage("Favor digite o número de uma das opções:");

        return task.execFunction(data, next, restart);
      }

      return await fn(data, Number(option.toFixed(0)) - 1, next, restart);
    });

    return task;
  }
}
