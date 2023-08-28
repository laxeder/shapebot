import type { CommandFunction } from "@modules/command/types/CommandFunction";

import ICommandData from "@modules/command/interfaces/ICommandData";

export type CommandRestart<T extends ICommandData> = (index?: number) => CommandFunction<T> | null;
