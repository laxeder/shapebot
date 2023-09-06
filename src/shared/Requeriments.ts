import { ICommandPermission, IMessage } from "rompot";

import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";

/** * Resultado da verificação dos requerimentos */
export declare type ReqCheckResult = { isPermited: boolean; req?: Requeriments };

/** * Verificação dos requerimentos */
export declare type RequerimentsCheks = { [Property in Requeriments]: (message: IMessage) => Promise<boolean> | boolean };

/**
 * * Os requerimentos representam oque é preciso para executar um comando
 * @example se conter "user-admin" será necessário ter admin no chat para executar o comando
 */
export enum Requeriments {
  ChatAdmin = "chat-admin",
  UserAdmin = "user-admin",
  BotAdmin = "bot-admin",
}

const reqChecks: RequerimentsCheks = {
  async [Requeriments.BotAdmin](message: IMessage) {
    const botController = new BotController(RepositoryUtils.getBotRepository());

    const botData = await botController.getBotById(message.client.id);

    return botData.admins.includes(String(message.user.id));
  },

  [Requeriments.ChatAdmin](message: IMessage) {
    return message.chat.isAdmin(message.client.id);
  },

  [Requeriments.UserAdmin](message: IMessage) {
    return message.chat.isAdmin(message.user.id);
  },
};

/** * Obter resultado da verificação dos requerimentos */
export function getReqCheckResult(isPermited: boolean, req?: Requeriments): ICommandPermission {
  return { isPermited: isPermited, id: req || "" };
}

/** * Verificar se contem todos os requerimentos */
export async function checkRequeriments(message: IMessage, ...requeriments: Requeriments[]) {
  return new Promise<ICommandPermission>(async (resolve, reject) => {
    var isPermited: boolean = true;

    await Promise.all(
      requeriments.map(async (req) => {
        if (!isPermited || !reqChecks.hasOwnProperty(req)) return;

        const result = await reqChecks[req](message);

        if (!result) {
          isPermited = false;

          resolve(getReqCheckResult(result, req));
        }
      })
    );

    resolve(getReqCheckResult(isPermited));
  });
}
