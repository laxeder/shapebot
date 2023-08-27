import { ClientUtils, isPollMessage, isReactionMessage } from "rompot";
import { IMessage } from "rompot-base";

import TextUtils from "@utils/TextUtils";

/**
 * Uma classe utilitária que contém métodos para interações com usuários através de mensagens.
 */
export default class BotUtils {
  /**
   * Aguarda até que um usuário envie uma mensagem em um determinado chat.
   * @param botId - O ID do bot.
   * @param chatId - O ID do chat.
   * @returns A mensagem enviada pelo usuário.
   */
  public static async awaitUserSendMessage(botId: string, chatId: string): Promise<IMessage> {
    const client = ClientUtils.getClient(botId);

    const msg = await client.awaitMessage(chatId, {
      ignoreMessageFromMe: false,
      stopRead: true,
    });

    if (msg.apiSend || msg.isDeleted) {
      return await BotUtils.awaitUserSendMessage(botId, chatId);
    }

    if (isReactionMessage(msg)) {
      return await BotUtils.awaitUserSendMessage(botId, chatId);
    }

    if (isPollMessage(msg)) {
      return BotUtils.awaitUserSendMessage(botId, chatId);
    }

    return msg;
  }

  /**
   * Aguarda até que um usuário envie uma confirmação ("sim", "não" ou similar).
   * @param botId - O ID do bot.
   * @param chatId - O ID do chat.
   * @param text - O texto opcional a ser exibido para solicitar a confirmação.
   * @returns `true` se o usuário confirmou, `false` se o usuário negou e `null` se a confirmação foi cancelada.
   */
  public static async awaitUserSendConfirmation(botId: string, chatId: string, text?: string): Promise<boolean | null> {
    const msg = await BotUtils.awaitUserSendMessage(botId, chatId);

    const confirm = msg.text.trim().toLowerCase().split(/\s+/)[0];

    if (confirm.startsWith("sim")) return true;
    if (confirm.startsWith("continua")) return true;
    if (confirm.startsWith("não")) return false;
    if (confirm.startsWith("nao")) return false;
    if (confirm.startsWith("cancela")) return null;

    const client = ClientUtils.getClient(botId);

    await client.sendMessage(chatId, text || "Favor digite *sim* ou *não* para continuar.");

    return await BotUtils.awaitUserSendConfirmation(botId, chatId, text);
  }

  /**
   * Aguarda até que um usuário selecione uma opção de uma lista.
   * @param botId - O ID do bot.
   * @param chatId - O ID do chat.
   * @param list - A lista de opções para escolher.
   * @returns O índice da opção selecionada ou `null` se cancelado.
   */
  public static async awaitUserSendOption(botId: string, chatId: string, list: Array<string | number>): Promise<number | null> {
    const msg = await BotUtils.awaitUserSendMessage(botId, chatId);

    if (msg.text.trim().toLowerCase().startsWith("cancel")) return null;
    if (msg.text.trim().toLowerCase().startsWith("sair")) return null;

    const result = list.filter((item) => msg.text.toLowerCase().includes(String(item).toLowerCase()));

    if (result.length > 0) {
      let index = 0;

      for (const i in result) {
        if (String(result[i]).length <= String(result[index]).length) continue;

        index = Number(i);
      }

      return list.indexOf(result[index]);
    }

    const optionNumber = Number(msg.text.replace(/\D+/g, ""));

    const option = Number(optionNumber);

    if (Number.isNaN(optionNumber) || option < 1 || option > list.length) {
      const client = ClientUtils.getClient(botId);

      await client.sendMessage(chatId, "Favor digite o número de uma das opções:");

      return await BotUtils.awaitUserSendOption(botId, chatId, list);
    }

    return Number(option.toFixed(0)) - 1;
  }

  /**
   * Aguarda até que um usuário envie uma mensagem de texto em um chat.
   * @param botId - O ID do bot.
   * @param chatId - O ID do chat.
   * @returns A mensagem de texto enviada pelo usuário ou `null` se cancelado.
   */
  public static async awaitUserSendText(botId: string, chatId: string): Promise<string | null> {
    const msg = await BotUtils.awaitUserSendMessage(botId, chatId);

    if (msg.text.trim().toLowerCase().startsWith("cancelar")) return null;
    if (msg.text.trim().toLowerCase().startsWith("sair")) return null;

    if (!msg.text.trim()) {
      const client = ClientUtils.getClient(botId);

      await client.sendMessage(chatId, "Favor mande-me uma mensagem em texto:");

      return await BotUtils.awaitUserSendText(botId, chatId);
    }

    return msg.text.trim();
  }

  /**
   * Aguarda até que um usuário envie um número.
   * @param botId - O ID do bot.
   * @param chatId - O ID do chat.
   * @param allNumbers - Se deve aceitar qualquer sequência numérica ou apenas números maiores que zero.
   * @returns O número enviado pelo usuário ou `null` se cancelado.
   */
  public static async awaitUserSendNumber(botId: string, chatId: string, allNumbers: boolean = false): Promise<number | null> {
    const msg = await BotUtils.awaitUserSendMessage(botId, chatId);

    if (msg.text.trim().toLowerCase().startsWith("cancelar")) return null;
    if (msg.text.trim().toLowerCase().startsWith("sair")) return null;

    const number = Number(msg.text.replace(/\D+/g, ""));

    if (Number.isNaN(number) || (allNumbers ? false : number <= 0)) {
      const client = ClientUtils.getClient(botId);

      await client.sendMessage(chatId, "Favor digite um número:");

      return await BotUtils.awaitUserSendNumber(botId, chatId);
    }

    return number;
  }

  /**
   * Aguarda até que um usuário envie um número de telefone.
   * @param botId - O ID do bot.
   * @param chatId - O ID do chat.
   * @returns O número de telefone enviado pelo usuário ou `null` se cancelado.
   */
  public static async awaitUserSendPhoneNumber(botId: string, chatId: string): Promise<string | null> {
    const msg = await BotUtils.awaitUserSendMessage(botId, chatId);

    if (msg.text.trim().toLowerCase().startsWith("cancelar")) return null;
    if (msg.text.trim().toLowerCase().startsWith("sair")) return null;

    const userId: string = msg.text.replace(/\D+/g, "");

    if (userId.length < 9 || userId.length > 15) {
      const client = ClientUtils.getClient(botId);

      await client.sendMessage(chatId, "Número inválido! Favor digite um número válido:");

      return await BotUtils.awaitUserSendPhoneNumber(botId, chatId);
    }

    return userId;
  }

  /**
   * Aguarda até que um usuário envie um valor monetário.
   * @param botId - O ID do bot.
   * @param chatId - O ID do chat.
   * @returns O valor monetário enviado pelo usuário ou `null` se cancelado.
   */
  public static async awaitUserSendMoneyValue(botId: string, chatId: string): Promise<number | null> {
    const msg = await BotUtils.awaitUserSendMessage(botId, chatId);

    if (msg.text.trim().toLowerCase().startsWith("cancelar")) return null;
    if (msg.text.trim().toLowerCase().startsWith("sair")) return null;

    const price = TextUtils.generateMoneyValue(msg.text);

    if (Number.isNaN(price)) {
      const client = ClientUtils.getClient(botId);

      await client.sendMessage(chatId, "O valor está incorreto! tente novamente:");

      return await BotUtils.awaitUserSendMoneyValue(botId, chatId);
    }

    if (price <= 0) {
      const client = ClientUtils.getClient(botId);

      await client.sendMessage(chatId, "O valor precisa ser 1 centavo ou maior, tente novamente:");

      return await BotUtils.awaitUserSendMoneyValue(botId, chatId);
    }

    return price;
  }
}
