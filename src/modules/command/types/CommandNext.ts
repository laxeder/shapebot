import type { CommandFunction } from "@modules/command/types/CommandFunction";

import ICommandData from "@modules/command/interfaces/ICommandData";

export type CommandNext<T extends ICommandData> = (data?: T, index?: number) => CommandFunction<T> | null;
