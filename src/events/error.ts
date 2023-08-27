import Logger from "@shared/Logger";

import { IClient } from "rompot";

export default async (client: IClient, err: Error) => {
  Logger.error(err, "Um erro ocorreu");
};
