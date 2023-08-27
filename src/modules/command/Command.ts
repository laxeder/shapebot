import type { MarshalArg } from "./CommandTypes";

import * as rompot from "rompot";

import { CMDAvaible, CMDRun } from "@modules/command/CommandEnums";
import ClientError from "@modules/error/models/ClientError";

import { checkRequeriments, Requeriments } from "@shared/Requeriments";
import Logger from "@shared/Logger";

import DateUtils from "@utils/Date";

export default class Command extends rompot.Command {
  public id: string = "";
  public requeriments: Requeriments[] = [];
  public avaible: Array<CMDAvaible | rompot.ChatType> = [CMDAvaible.Pv];
  public messageError: string = "Serviço indisponível no momento. Por Favor tente novamente mais tarde.";

  public async [CMDRun.Exec](message: rompot.IMessage, ...args: MarshalArg[]): Promise<any> {}

  public async [CMDRun.Reply](message: rompot.IMessage, ...args: MarshalArg[]): Promise<any> {}

  public async onError(message: rompot.IMessage, err: any, errMsg: string = this.messageError): Promise<void> {
    try {
      Logger.error(err, `[${DateUtils.ISO()}]`, `[${this.client.id}]`, `[${this.id}]`);

      if (err instanceof ClientError) {
        await this.client.sendMessage(message.chat.id, `❌ ${err.message}. Favor tente novamente, acaso persista com o problema entre em contato com um administrador e relate o problema`);
      } else {
        await this.client.sendMessage(message.chat.id, errMsg);
      }
    } catch (err) {
      Logger.error(err, "Internal error");
    }
  }

  public async checkPerms(message: rompot.IMessage): Promise<rompot.ICommandPermission | null> {
    return await checkRequeriments(message, ...this.requeriments);
  }
}
