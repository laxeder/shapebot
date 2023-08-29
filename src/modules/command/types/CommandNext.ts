import type { CommandTask } from "@modules/command/types/CommandTask";

import ICommandData from "@modules/command/interfaces/ICommandData";

export type CommandNext<T extends ICommandData> = (data?: T, index?: number) => CommandTask<T> | null;
