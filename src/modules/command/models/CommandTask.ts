import type { CommandAwaitable } from "@modules/command/types/CommandAwaitable";
import type { CommandRestart } from "@modules/command/types/CommandRestart";
import type { CommandNext } from "@modules/command/types/CommandNext";

import CommandData from "@modules/command/models/CommandData";
import Command from "@modules/command/models/Command";

export default class CommandTask<T extends CommandData> {
  public type: "void" | "function" | "stop" = "function";

  public fn(command: Command<T>, data: T, next: CommandNext<T>, restart: CommandRestart<T>): CommandAwaitable<CommandTask<T>> {
    return next(data);
  }

  constructor(public command: Command<T>, type: CommandTask<T>["type"] = "function") {
    this.type = type;
  }

  public setType(type: this["type"]): void {
    this.type = type;
  }

  public setFunction(fn: this["fn"]): void {
    this.fn = fn;
  }

  public async execFunction(data: T, next: CommandNext<T>, restart: CommandRestart<T>) {
    this.command.data = data;

    return await this.fn(this.command, data, next, restart);
  }
}
