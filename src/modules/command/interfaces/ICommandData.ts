import { IMessage } from "rompot";

export default interface ICommandData {
  currentTaskIndex: number;
  lastMessage: IMessage;
  running: boolean;
}
