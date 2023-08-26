import { ClientUtils } from "rompot";
import winston from "winston";

import { getEnvironment } from "@configs/environments";

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

      logger.logger[type](message);

      const client = ClientUtils.getClient(ClientUtils.getClients()[0]?.id || "");

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

      const bots = await BotController.getAllBots();

      //? Obtem o primeiro bot da lista
      const bot = bots[0];

      if (!bot) return;

      for (const chat of bot.devChats) {
        await client.sendMessage(chat, text);
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
