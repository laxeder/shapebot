import { IClient, ButtonMessage, ListMessage, ReactionMessage, PollUpdateMessage, PollMessage, IMessage } from "rompot";

import Command, { CMDRun, MarshalCMD } from "@modules/command";

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

      const executed = await client.runCommand(cmd, message, marshalCMD.type);

      if (executed || message.fromMe) return;
    }

    if (message.chat.type != "pv" || message.fromMe) return;
  } catch (err) {
    Logger.error(err, `Message error (${message.selected || message.text})`);

    await message.addReaction("❌");
  }
};
