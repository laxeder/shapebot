import ICommandData from "../interfaces/ICommandData";

export default class CommandDataKey<T extends ICommandData> {
  constructor(public key: keyof T) {}
}
