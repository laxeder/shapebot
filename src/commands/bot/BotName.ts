import { CMDKey, IMessage } from "rompot";

import BotController from "@modules/bot/controllers/BotController";
import Command from "@modules/command";

import { Requeriments } from "@shared/Requeriments";
import UserUtils from "@modules/user/utils/UserUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";

export class ChangeBotNameCommand extends Command {
  public onRead() {
    this.id = "change-bot-name";
    this.keys = [CMDKey("alter", "nome", "bot")];
    this.requeriments = [Requeriments.BotAdmin];
  }

  public async onExec(message: IMessage): Promise<void> {
    try {
      await this.client.sendMessage(message.chat.id, "*Alterar nome do bot*\n\n_Me mande o novo nome do bot._");

      const botController = new BotController(RepositoryUtils.getBotRepository());

      const name = await UserUtils.awaitUserSendText(this.clientId, message.chat.id);

      if (name == null) {
        await this.client.sendMessage(message.chat.id, "A alteração do nome do bot foi cancelada! ❌");

        return;
      }

      await botController.updateBot({ id: this.clientId, name });

      await this.client.sendMessage(message.chat.id, "O nome do bot foi alterado com sucesso! ✅");
    } catch (err) {
      this.onError(message, err);
    }
  }
}
