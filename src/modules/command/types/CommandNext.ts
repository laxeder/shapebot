import type { CommandAwaitable } from "@modules/command/types/CommandAwaitable";
import type { CommandTask } from "@modules/command/types/CommandTask";

import CommandData from "@modules/command/models/CommandData";

export type CommandNext<T extends CommandData> = (data?: T, index?: number) => CommandAwaitable<CommandTask<T> | null>;
