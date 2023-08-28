import { IMessage, Message } from "rompot";

import ICommandData from "@modules/command/interfaces/ICommandData";

export default class CommandDataUtils {
  public static generateEmpty<T extends Record<string | number | symbol, any>>(data: T): ICommandData & T {
    return { ...{ lastMessage: new Message("", ""), currentFunctionIndex: 0 }, ...data };
  }

  public static generate<T extends Record<string | number | symbol, any>>(lastMessage: IMessage, currentFunctionIndex: number, data: T): ICommandData & T {
    return { lastMessage, currentFunctionIndex, ...data };
  }
}
