import type { CommandTask } from "@modules/command/types/CommandTask";

import ICommandData from "@modules/command/interfaces/ICommandData";

export type CommandRestart<T extends ICommandData> = (index?: number) => CommandTask<T> | null;
