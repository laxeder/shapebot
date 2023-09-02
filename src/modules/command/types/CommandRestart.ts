import type { CommandAwaitable } from "@modules/command/types/CommandAwaitable";

import CommandData from "@modules/command/models/CommandData";
import CommandTask from "@modules/command/models/CommandTask";

export type CommandRestart<T extends CommandData> = (index?: number) => CommandAwaitable<CommandTask<T>>;
