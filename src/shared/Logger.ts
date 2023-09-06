import { ClientUtils } from "rompot";
import winston from "winston";

import { getEnvironment } from "@configs/environments";

import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import ErrorUtils from "@modules/error/utils/ErrorUtils";

export default class Logger {
  public winston: winston.Logger;

  constructor(public botId?: string, public chatId?: string) {
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

    this.winston = winston.createLogger(loggerConfig);
  }

  public async log(type: "info" | "warn" | "error", message: string) {
    try {
      this.winston[type](message);

      if (!this.botId) return;

      const client = ClientUtils.getClient(this.botId);

      if (client.status !== "online") return;

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

      if (!text) return;

      const botController = new BotController(RepositoryUtils.getBotRepository());

      const bot = await botController.getBotById(client.id);

      for (const chat of bot.devChats) {
        await client.sendMessage(chat, text);
      }

      if (this.chatId) {
        for (const attendant of bot.attendants) {
          await client.sendMessage(attendant, `Um erro ocorreu na conversa: "${this.chatId}"\n\n${text}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  public info(...message: any[]) {
    return this.log("info", message.join(" "));
  }

  public warn(...message: any[]) {
    return this.log("warn", message.join(" "));
  }

  public error(err: any, ...message: any[]) {
    return this.log("error", `${message.join(" ")}\n\n${ErrorUtils.getStackError(err)}`);
  }
}
