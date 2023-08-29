import { IMessage, Message } from "rompot";

import ICommandData from "@modules/command/interfaces/ICommandData";

export default class CommandDataUtils {
  public static generateEmpty<T extends Record<string | number | symbol, any>>(data: T): ICommandData & T {
    return { ...{ lastMessage: new Message("", ""), currentTaskIndex: 0, running: false }, ...data };
  }

  public static generate<T extends Record<string | number | symbol, any>>(lastMessage: IMessage, currentTaskIndex: number, data: T): ICommandData & T {
    return { lastMessage, currentTaskIndex, running: false, ...data };
  }
}
