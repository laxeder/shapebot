import type { CommandAwaitable } from "@modules/command/types/CommandAwaitable";
import type { CommandRestart } from "@modules/command/types/CommandRestart";
import type { CommandNext } from "@modules/command/types/CommandNext";

import CommandData from "@modules/command/models/CommandData";

export type CommandTask<T extends CommandData> = (data: T, next: CommandNext<T>, restart: CommandRestart<T>) => CommandAwaitable<ReturnType<CommandNext<T>>>;
