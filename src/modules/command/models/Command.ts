import type { CommandAwaitable } from "@modules/command/types/CommandAwaitable";
import type { CommandRestart } from "@modules/command/types/CommandRestart";
import type { CommandTask } from "@modules/command/types/CommandTask";
import type { CommandNext } from "@modules/command/types/CommandNext";

import * as rompot from "rompot";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import CommandDataKey from "@modules/command/models/CommandDataKey";
import CommandData from "@modules/command/models/CommandData";

import Logger from "@shared/Logger";

import TextUtils from "@utils/TextUtils";

export default class Command<T extends CommandData> extends rompot.Command {
  public id: string = "";
  public avaible: rompot.ChatType[] = ["pv"];
  public tasks: CommandTask<T>[] = [];
  public data: T;

  //? Implementado externamente
  public saveData: (data: T) => any = (data) => {
    this.data = data;
  };
  public restoreData: (data: T) => CommandAwaitable<T> = (data) => {
    return data;
  };

  public emitError: (err: any) => any = async (error) => {
    try {
      Logger.error(error, `Command error "${this.id}" - [${this.data.currentTaskIndex}]: ${JSON.stringify(this.data, ["\n"], 2)}`);

      if (this.data.currentTaskIndex == 0) {
        await this.sendMessage("Serviço indiponível no momento! Favor tente novamente mais tarde.");
      } else {
        await this.sendMessage("Um erro ocorreu durante o processamento da conversa. Favor tente novamente, acaso persista no problema comunique com o suporte do bot.");
      }
    } catch (err) {
      Logger.error(err, "Command logger error", `"${this.id}"`);
    }
  };

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
    await this.startTasks(message);
  }

  public async onReply(message: rompot.IMessage) {
    await this.startTasks(message);
  }

  public addTask(task: CommandTask<T>): void {
    this.tasks.push(task);
  }

  public getTask(index: number): CommandTask<T> | null {
    if (index >= this.tasks.length) return null;

    return this.tasks[index] || null;
  }

  public async startTasks(message: rompot.IMessage): Promise<void> {
    this.data.id = this.id;
    this.data.botId = this.client.id;
    this.data.chatId = message.chat.id;

    this.data = await this.restoreData(this.data);

    this.data.lastMessage = message;
    this.data.currentTaskIndex = 0;
    this.data.running = true;

    this.saveData(this.data);

    await this.initTask(this.getTask(this.data.currentTaskIndex));
  }

  public async initTask(task: Awaited<ReturnType<CommandNext<T>>>): Promise<void> {
    try {
      if (task == null) return;

      const fn = await task(this.data, this.nextTask.bind(this), this.restartTask.bind(this));

      if (fn == null) return;

      await this.initTask(fn);
    } catch (err) {
      this.emitError(err);
    }
  }

  public nextTask(updatedData: T = this.data, index: number = this.data.currentTaskIndex + 1): ReturnType<CommandNext<T>> {
    try {
      this.data = updatedData;
      this.data.currentTaskIndex = index;

      this.saveData(this.data);

      return this.getTask(index);
    } catch (err) {
      this.emitError(err);

      return null;
    }
  }

  public restartTask(index: number = this.data.currentTaskIndex): ReturnType<CommandNext<T>> {
    try {
      this.data.currentTaskIndex = index;

      this.saveData(this.data);

      return this.getTask(index);
    } catch (err) {
      this.emitError(err);

      return null;
    }
  }

  public stopTasks(): null {
    try {
      this.data.running = false;

      this.saveData(this.data);

      return null;
    } catch (err) {
      this.emitError(err);

      return null;
    }
  }

  public async sendMessage(message: string | rompot.IMessage): Promise<rompot.IMessage> {
    if (typeof message != "string" && rompot.isMessage(message)) {
      if (!message.chat.id) message.chat.id = this.data.chatId;

      return await this.client.send(message);
    } else {
      return await this.client.sendMessage(this.data.chatId, message);
    }
  }

  public waitForMessage(task: (data: T, message: rompot.IMessage, next: CommandNext<T>, restart: CommandRestart<T>) => ReturnType<CommandTask<T>>): CommandTask<T> {
    const fn = async (data: T, next: CommandNext<T>, restart: CommandRestart<T>): Promise<ReturnType<CommandNext<T>>> => {
      const waitForMessageConfig = { stopRead: true, ignoreMessageFromMe: false };

      const lastMessage = await this.client.awaitMessage(data.lastMessage.chat.id, waitForMessageConfig);

      if (lastMessage.apiSend) return fn(data, next, restart);

      return await task(data, lastMessage, next, restart);
    };

    return fn;
  }

  public waitForText(task: (data: T, text: string | null, next: CommandNext<T>, restart: CommandRestart<T>) => ReturnType<CommandTask<T>>): CommandTask<T> {
    return this.waitForMessage(async (data: T, message: rompot.IMessage, next: CommandNext<T>, restart: CommandRestart<T>) => {
      if (!message.text) {
        await this.sendMessage("Favor digite um texto válido:");

        return this.waitForText(task)(data, next, restart);
      }

      if (TextUtils.isCanceled(message.text)) {
        return await task(data, null, next, restart);
      }

      return await task(data, message.text, next, restart);
    });
  }

  public waitForNumber(task: (data: T, number: number | null, next: CommandNext<T>, restart: CommandRestart<T>) => ReturnType<CommandTask<T>>, allNumbers: boolean = false): CommandTask<T> {
    return this.waitForText(async (data, text, next, restart) => {
      if (text == null) {
        return await task(data, null, next, restart);
      }

      const num = Number(text.replace(/\D+/g, ""));

      if (Number.isNaN(num)) {
        await this.sendMessage("Favor digite um número válido:");

        return this.waitForNumber(task)(data, next, restart);
      }

      if (allNumbers && num < 0) {
        await this.sendMessage("Favor digite um número maior que zero:");

        return this.waitForNumber(task)(data, next, restart);
      }

      return await task(data, num, next, restart);
    });
  }

  public waitForPhonenumber(task: (data: T, phonenumber: number | null, next: CommandNext<T>, restart: CommandRestart<T>) => ReturnType<CommandTask<T>>): CommandTask<T> {
    return this.waitForNumber(async (data, num, next, restart) => {
      if (num == null) {
        return await task(data, null, next, restart);
      }

      if (String(num).length < 8 || String(num).length > 15) {
        await this.sendMessage("Favor digite um número no formato internacional (Ex: +55 15 12345-9999):");

        return this.waitForPhonenumber(task)(data, next, restart);
      }

      return await task(data, num, next, restart);
    });
  }

  public waitForOption(
    options: Array<any> | CommandDataKey<T>,
    task: (data: T, option: number | null, next: CommandNext<T>, restart: CommandRestart<T>) => ReturnType<CommandTask<T>>
  ): CommandTask<T> {
    return this.waitForText(async (data, text, next, restart) => {
      if (text == null) {
        return await task(data, null, next, restart);
      }

      options = CommandDataUtils.getValue<T, any[]>(data, options);

      const result = options.filter((opt) => text.toLowerCase().includes(String(opt).toLowerCase()));

      if (result.length > 0) {
        let index = 0;

        for (const i in result) {
          if (String(result[i]).length <= String(result[index]).length) continue;

          index = Number(i);
        }

        return await task(data, result[index], next, restart);
      }

      const option = Number(text.replace(/\D+/g, ""));

      if (Number.isNaN(option) || option < 1 || option > options.length) {
        await this.sendMessage("Favor digite o número de uma das opções:");

        return this.waitForOption(options, task)(data, next, restart);
      }

      return await task(data, Number(option.toFixed(0)) - 1, next, restart);
    });
  }
}
