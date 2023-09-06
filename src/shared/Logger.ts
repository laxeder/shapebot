import { ClientUtils } from "rompot";
import winston from "winston";

import { getEnvironment } from "@configs/environments";

import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import ErrorUtils from "@modules/error/utils/ErrorUtils";

export default class Logger {
  public logger: winston.Logger;

  constructor() {
    const timestampFormat = winston.format.timestamp({
      format: getEnvironment() != "production" ? "HH:MM:ss.SSS" : "YYYY-MM-DD HH:mm:ss.SSS",
    });

    const logFormat = winston.format.printf(({ level, timestamp, message }) => {
      level = level.replace(/m(.*?)/, (match) => `m${match.replace("m", "").toUpperCase()}`);

      return `[${level}] [${[timestamp]}] ${message}`;
    });

    const loggerConfig = {
      format: winston.format.combine(timestampFormat, winston.format.colorize(), logFormat),
      transports: [new winston.transports.Console(), new winston.transports.File({ filename: "logs/error.log", level: "error" })],
    };

    this.logger = winston.createLogger(loggerConfig);
  }

  public static async log(type: "info" | "warn" | "error", message: string) {
    try {
      const logger = new Logger();

      logger.logger[type](message.replace(/\n/g, "\n"));

      const clients = ClientUtils.getClients();

      if (Object.keys(clients).length == 0) return;

      const client = clients[Object.keys(clients)[0]];

      let text = "";

      if (type == "info") {
        text = `*[INFO]* ${message}`;
      }

      if (type == "warn") {
        text = `*[WARN]* ${message}`;
      }

      if (type == "error") {
        text = `*[ERROR]* ${message}`;
      }

      if (client.status !== "online") return;
      if (!text) return;

      const botController = new BotController(RepositoryUtils.getBotRepository());

      const bot = await botController.getBotById(client.id);

      if (!bot) return;

      for (const chat of bot.devChats) {
        await client.sendMessage(chat, text.replace("\n", "\n"));
      }
    } catch (err) {}
  }

  public static info(...message: any[]) {
    Logger.log("info", message.join(" "));
  }

  public static warn(...message: any[]) {
    Logger.log("warn", message.join(" "));
  }

  public static error(err: any, ...message: any[]) {
    Logger.log("error", `${message.join(" ")}. ${ErrorUtils.getStackError(err)}`);
  }
}
