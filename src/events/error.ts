import Logger from "@shared/Logger";

import { IClient } from "rompot";

export default async (client: IClient, err: Error) => {
  const logger = new Logger(client.id);

  logger.error(err, "Um erro ocorreu");
};
