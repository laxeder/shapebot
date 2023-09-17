import { IClient, ButtonMessage, ListMessage, ReactionMessage, PollUpdateMessage, PollMessage, IMessage } from "rompot";

import MarshalCMD from "@modules/command/models/MarshalCMD";
import { CMDRun } from "@modules/command/models/CommandRun";
import Command from "@modules/command/models/Command";

import Logger from "@shared/Logger";

export default async (client: IClient, message: IMessage) => {
  try {
    //! =================================================================
    //! =============== VERIFICANDO SE A MENSAGEM DEVE SER LIDA
    //! =================================================================

    if (message instanceof ButtonMessage || message instanceof ListMessage || message instanceof ReactionMessage) return;

    if (message instanceof PollMessage) {
      if (message instanceof PollUpdateMessage) {
        if (!!!message.selected || message.selected == "poll-ignore" || message.action == "remove") return;
      } else return;
    }

    if (message.chat.type != "pv") return;
    if (message.isDeleted) return;
    if (message.apiSend) return;

    const logger = new Logger(client.id);

    logger.info(`New Message [${message.type}] [${message.chat.id}]: ${message.text}`);

    //! =================================================================
    //! =============== LENDO COMANDOS
    //! =================================================================

    const marshalCMD = MarshalCMD.get(message.selected || message.text, !!!message.selected ? CMDRun.Exec : CMDRun.Reply);

    let cmd = client.searchCommand(marshalCMD.id || marshalCMD.name);

    if (cmd && cmd instanceof Command) {
      if (!cmd.avaible.includes(message.chat.type)) return;

      //! =================================================================
      //! =============== EXECUTANDO COMANDO SOLICITADO NA MENSAGEM
      //! =================================================================

      await message.read();

      const executed = await client.runCommand(cmd, message, marshalCMD.type);

      if (executed || message.fromMe) return;
    }

    if (message.chat.type != "pv" || message.fromMe) return;
  } catch (err) {
    const logger = new Logger(client.id, message.chat.id);

    logger.error(err, `Message error (${message.selected || message.text})`);

    await message.addReaction("❌");
  }
};
