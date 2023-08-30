import type { CommandAwaitable } from "@modules/command/types/CommandAwaitable";
import type { CommandRestart } from "@modules/command/types/CommandRestart";
import type { CommandNext } from "@modules/command/types/CommandNext";

import ICommandData from "@modules/command/interfaces/ICommandData";

export type CommandTask<T extends ICommandData> = (data: T, next: CommandNext<T>, restart: CommandRestart<T>) => CommandAwaitable<ReturnType<CommandNext<T>>>;
