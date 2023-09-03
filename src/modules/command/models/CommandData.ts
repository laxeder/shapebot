import { IMessage } from "rompot";

import DataModel from "@modules/database/models/DataModel";

export default interface CommandData extends DataModel {
  botId: string;
  chatId: string;
  isRunning: boolean;
  isHead: boolean;
  lastMessage: IMessage;
  currentTaskIndex: number;
}
