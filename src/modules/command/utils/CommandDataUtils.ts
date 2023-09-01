import { IMessage, Message } from "rompot";

import CommandDataKey from "@modules/command/models/CommandDataKey";
import CommandData from "@modules/command/models/CommandData";
import DataModel from "@modules/database/models/DataModel";

export default class CommandDataUtils {
  public static generateEmpty<T extends Record<string | number | symbol, any>>(data: T): CommandData & T {
    return { ...new DataModel(), ...{ lastMessage: new Message("", ""), currentTaskIndex: 0, isRunning: false, botId: "", chatId: "" }, ...data };
  }

  public static generate<T extends Record<string | number | symbol, any>>(id: string, botId: string, chatId: string, lastMessage: IMessage, currentTaskIndex: number, data: T): CommandData & T {
    return { ...new DataModel(), id, botId, chatId, lastMessage, currentTaskIndex, isRunning: false, ...data };
  }

  public static getValue<T extends CommandData, R extends any>(data: T, content: any): R {
    if (typeof content != "object" || Array.isArray(content) || !(content instanceof CommandDataKey)) {
      return content as R;
    }

    return data[content.key as keyof T] as R;
  }
}
