import CommandData from "@modules/command/models/CommandData";

export default class CommandDataKey<T extends CommandData> {
  constructor(public key: keyof T) {}
}
