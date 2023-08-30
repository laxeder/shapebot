import { IMessage, Message } from "rompot";

import ICommandData from "@modules/command/interfaces/ICommandData";
import CommandDataKey from "@modules/command/models/CommandDataKey";

export default class CommandDataUtils {
  public static generateEmpty<T extends Record<string | number | symbol, any>>(data: T): ICommandData & T {
    return { ...{ lastMessage: new Message("", ""), currentTaskIndex: 0, running: false }, ...data };
  }

  public static generate<T extends Record<string | number | symbol, any>>(lastMessage: IMessage, currentTaskIndex: number, data: T): ICommandData & T {
    return { lastMessage, currentTaskIndex, running: false, ...data };
  }

  public static getValue<T extends ICommandData, R extends any>(data: T, content: any): R {
    if (typeof content != "object" || Array.isArray(content) || !(content instanceof CommandDataKey)) {
      return content as R;
    }

    return data[content.key as keyof T] as R;
  }
}
