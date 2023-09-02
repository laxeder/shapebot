import type { CommandAwaitable } from "@modules/command/types/CommandAwaitable";

import CommandData from "@modules/command/models/CommandData";
import CommandTask from "@modules/command/models/CommandTask";

export type CommandNext<T extends CommandData> = (data?: T, index?: number) => CommandAwaitable<CommandTask<T>>;
