import type { CommandFunction } from "@modules/command/types/CommandFunction";
import type { CommandNext } from "@modules/command/types/CommandNext";

import * as rompot from "rompot";

import ICommandData from "@modules/command/interfaces/ICommandData";

export default class Command<T extends ICommandData> extends rompot.Command {
  public id: string = "";
  public functions: CommandFunction<T>[] = [];
  public data: T;

  get chatId(): string {
    return this.data.lastMessage.chat.id;
  }

  set chatId(id: string) {
    this.data.lastMessage.chat.id = id;
  }

  constructor(data: T, keys: rompot.CommandKey[] = []) {
    super();

    this.keys = keys;
    this.data = data;
  }

  public addFunc(fn: CommandFunction<T>): void {
    this.functions.push(fn);
  }

  public getFunction(index: number): CommandFunction<T> | null {
    if (index >= this.functions.length) return null;

    return this.functions[index] || null;
  }

  public async start(message: rompot.IMessage): Promise<void> {
    this.data.lastMessage = message;
    this.data.currentFunctionIndex = 0;
    this.data.running = true;

    this.saveData(this.data);

    return await this.initFunction(this.getFunction(this.data.currentFunctionIndex));
  }

  public async initFunction(fn: ReturnType<CommandNext<T>>): Promise<void> {
    if (fn == null) return;

    return this.initFunction(await fn(this.data, this.next));
  }

  public next(updatedData: T = this.data, index: number = this.data.currentFunctionIndex + 1): ReturnType<CommandNext<T>> {
    this.data = updatedData;
    this.data.currentFunctionIndex = index;

    this.saveData(this.data);

    return this.getFunction(index);
  }

  public stop(): null {
    this.data.running = false;

    this.saveData(this.data);

    return null;
  }

  public waitForMessage(fn: (data: T, message: rompot.IMessage, next: CommandNext<T>) => ReturnType<CommandFunction<T>>): CommandFunction<T> {
    return async (data: T, next: CommandNext<T>) => {
      const waitForMessageConfig = { stopRead: true, ignoreMessageFromMe: false };

      const lastMessage = await this.client.awaitMessage(data.lastMessage.chat.id, waitForMessageConfig);

      return await fn(data, lastMessage, next);
    };
  }

  public waitForText(fn: (data: T, text: string, next: CommandNext<T>) => ReturnType<CommandFunction<T>>): CommandFunction<T> {
    return this.waitForMessage(async (data: T, message: rompot.IMessage, next: CommandNext<T>) => {
      if (!message.text) {
        await this.client.sendMessage(data.lastMessage.chat.id, "Favor digite um texto válido:");

        return await this.waitForText(fn);
      }

      return await fn(data, message.text, next);
    });
  }

  public waitForNumber(fn: (data: T, number: number, next: CommandNext<T>) => ReturnType<CommandFunction<T>>, allNumbers: boolean = false): CommandFunction<T> {
    return this.waitForText(async (data: T, text: string, next: CommandNext<T>) => {
      const num = Number(text.replace(/\D+/g, ""));

      if (Number.isNaN(num)) {
        await this.client.sendMessage(data.lastMessage.chat.id, "Favor digite um número válido:");

        return await this.waitForNumber(fn);
      }

      if (allNumbers && num < 0) {
        await this.client.sendMessage(data.lastMessage.chat.id, "Favor digite um número maior que zero:");

        return await this.waitForNumber(fn);
      }

      return await fn(data, num, next);
    });
  }

  public waitForPhonenumber(fn: (data: T, phonenumber: number, next: CommandNext<T>) => ReturnType<CommandFunction<T>>): CommandFunction<T> {
    return this.waitForNumber(async (data: T, num: number, next: CommandNext<T>) => {
      if (String(num).length < 8 || String(num).length > 15) {
        await this.client.sendMessage(data.lastMessage.chat.id, "Favor digite um número no formato internacional (Ex: +55 15 12345-9999):");

        return await this.waitForPhonenumber(fn);
      }

      return await fn(data, num, next);
    });
  }

  public waitForOption(options: Array<any>, fn: (data: T, option: number, next: CommandNext<T>) => ReturnType<CommandFunction<T>>): CommandFunction<T> {
    return this.waitForText(async (data: T, text: string, next: CommandNext<T>) => {
      const result = options.filter((opt) => text.toLowerCase().includes(String(opt).toLowerCase()));

      if (result.length > 0) {
        let index = 0;

        for (const i in result) {
          if (String(result[i]).length <= String(result[index]).length) continue;

          index = Number(i);
        }

        return await fn(data, result[index], next);
      }

      const option = Number(Number(text.replace(/\D+/g, "")));

      if (Number.isNaN(option) || option < 1 || option > options.length) {
        await this.client.sendMessage(data.lastMessage.chat.id, "Favor digite o número de uma das opções:");

        return await this.waitForOption(options, fn);
      }

      return await fn(data, Number(option.toFixed(0)) - 1, next);
    });
  }

  public async saveData(data: T): Promise<void> {}

  public async restoreData(data: T): Promise<void> {
    this.data = data;
  }

  public async onExec(message: rompot.IMessage): Promise<void> {
    await this.start(message);
  }
}
