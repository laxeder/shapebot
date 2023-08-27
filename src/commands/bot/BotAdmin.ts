import { CMDKey, IMessage } from "rompot";

import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import UserUtils from "@modules/user/utils/UserUtils";
import Command from "@modules/command";

import { Requeriments } from "@shared/Requeriments";

import TextUtils from "@utils/TextUtils";

export class BotListAdminCommand extends Command {
  public onRead() {
    this.id = "list-admins";
    this.keys = [CMDKey("admins")];
    this.requeriments = [Requeriments.BotAdmin];
  }

  public async onExec(message: IMessage): Promise<void> {
    try {
      const botController = new BotController(RepositoryUtils.getBotRepository());

      const botData = await botController.getBotById(this.client.id);

      let text = "*🔰 Lista de admins*";
      text += `\n▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔`;

      if (botData.admins.length == 0) {
        text += `\n_Nenhum admin foi adicionado._`;
      } else {
        text += `\n${TextUtils.generateOptions(botData.admins)}`;
      }

      text += "\n\nDigite *Adicionar admin* para adicionar um novo ou *Remover admin* para remover um existente.";

      await this.client.sendMessage(message.chat.id, text);
    } catch (err) {
      this.onError(message, err);
    }
  }
}

export class AddBotAdminCommand extends Command {
  public onRead() {
    this.id = "add-bot-admin";
    this.keys = [CMDKey("adicion", "admin")];
    this.requeriments = [Requeriments.BotAdmin];
  }

  public async onExec(message: IMessage): Promise<void> {
    try {
      await this.client.sendMessage(message.chat.id, "Me mande o número do admin que voce deseja adicionar.");

      const botController = new BotController(RepositoryUtils.getBotRepository());

      const adminId = await UserUtils.awaitUserSendPhoneNumber(this.client.id, message.chat.id);

      if (adminId == null) {
        await this.client.sendMessage(message.chat.id, "A adição do admin foi cancelada! ❌");

        return;
      }

      const botData = await botController.getBotById(this.client.id);

      if (botData.admins.includes(adminId)) {
        await this.client.sendMessage(message.chat.id, "Esse número já é um admin do bot! ❌");

        return;
      }

      botData.admins.push(adminId);

      await botController.updateBot(botData);

      await this.client.sendMessage(message.chat.id, "Novo admin adicionado com sucesso! ✅");
    } catch (err) {
      this.onError(message, err);
    }
  }
}

export class RemoveBotAdminCommand extends Command {
  public onRead() {
    this.id = "remove-bot-admin";
    this.keys = [CMDKey("rem", "admin")];
    this.requeriments = [Requeriments.BotAdmin];
  }

  public async onExec(message: IMessage): Promise<void> {
    try {
      const botController = new BotController(RepositoryUtils.getBotRepository());

      const botData = await botController.getBotById(this.client.id);

      if (botData.admins.length == 0) {
        await this.client.sendMessage(message.chat.id, "Nenhum admin foi adicionado para ser removido! ❌");
        return;
      }

      let text = "*🔰 Lista de admins*";
      text += `\n▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔`;
      text += `\n${TextUtils.generateOptions(botData.admins)}`;
      text += "\n\nDigite o número da opção do admin que voce deseja remover.";

      await this.client.sendMessage(message.chat.id, text);

      const option = await UserUtils.awaitUserSendOption(this.client.id, message.chat.id, botData.admins);

      if (option == null) {
        await this.client.sendMessage(message.chat.id, "A remoção do admin foi cancelada! ❌");

        return;
      }

      const adminId: string = botData.admins[option];

      if (!botData.admins.includes(adminId)) {
        await this.client.sendMessage(message.chat.id, "Esse número não é um admin do bot! ❌");

        return;
      }

      botData.admins = botData.admins.filter((id) => id != adminId);

      await botController.updateBot(botData);

      await this.client.sendMessage(message.chat.id, "Admin removido com sucesso! ✅");
    } catch (err) {
      this.onError(message, err);
    }
  }
}
