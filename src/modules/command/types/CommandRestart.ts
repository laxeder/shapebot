import type { CommandAwaitable } from "@modules/command/types/CommandAwaitable";
import type { CommandTask } from "@modules/command/types/CommandTask";

import CommandData from "@modules/command/models/CommandData";

export type CommandRestart<T extends CommandData> = (index?: number) => CommandAwaitable<CommandTask<T> | null>;
