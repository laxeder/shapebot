import type { CommandRestart } from "@modules/command/types/CommandRestart";
import type { CommandNext } from "@modules/command/types/CommandNext";

import ICommandData from "@modules/command/interfaces/ICommandData";

type Awaitable<T> = Promise<T> | T;

export type CommandFunction<T extends ICommandData> = (data: T, next: CommandNext<T>, restart: CommandRestart<T>) => Awaitable<ReturnType<CommandNext<T>>>;
