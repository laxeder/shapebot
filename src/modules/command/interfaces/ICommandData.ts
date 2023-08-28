import { IMessage } from "rompot";

export default interface ICommandData {
  currentFunctionIndex: number;
  lastMessage: IMessage;
  running: boolean;
}
