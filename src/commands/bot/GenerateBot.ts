import Client, { CMDKey, ImageMessage, MultiFileAuthState, WhatsAppBot } from "rompot";
import { imageSync } from "qr-image";

import { getBaileysConfig } from "@configs/WAConfig";

import CommandDataUtils from "@modules/command/utils/CommandDataUtils";
import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";
import GenerateBot from "@modules/bot/models/GenerateBot";
import Command from "@modules/command/models/Command";

import { Requeriments } from "@shared/Requeriments";

//! ===== Configurando comando =====

export const cmd = new Command(CommandDataUtils.generateEmpty({ botName: "" }));

cmd.id = "generate-bot";
cmd.requeriments = [Requeriments.BotAdmin];
cmd.keys = [CMDKey("ger", "nov", "bot"), CMDKey("cri", "novo", "bot")];

//! ===== Etapa 1: Inicialização =====

cmd.addTask(async (data, next) => {
  await cmd.sendMessage("Digite o nome do novo bot:");

  return next();
});

//! ===== Etapa 2: Obtendo nome do novo bot =====

cmd.addTask(
  cmd.waitForText(async (data, botName, next) => {
    if (botName == null) {
      await cmd.sendMessage("A geração do bot foi cancelada! ❌");

      return cmd.stopTasks();
    }

    data.botName = botName;

    return next(data);
  })
);

//! ===== Etapa 3: Gerando bot =====

cmd.addTask(async (data) => {
  return new Promise(async (res) => {
    await cmd.sendMessage("Gerando novo bot...");

    // Cria um novo cliente para o bot
    const newClient = new Client(new WhatsAppBot(getBaileysConfig()), {
      disableAutoCommand: true,
      disableAutoRead: true,
    });

    const generateBot = new GenerateBot(newClient);

    // Gerando QR Code para autenticação do bot
    generateBot.$onQR.subscribe(async (qr) => {
      await cmd.sendMessage("Escaneie o QR Code com o WhatsApp do bot para autenticar ele");
      await cmd.sendMessage(new ImageMessage(data.chatId, "", imageSync(qr, { type: "png" })));
    });

    // Avisando quando o bot for conectado
    generateBot.$onOpen.subscribe(async () => {
      await cmd.sendMessage(`Bot conectado com sucesso! (${generateBot.client.id})`);
      await cmd.sendMessage("Configurando bot...");

      const botController = new BotController(RepositoryUtils.getBotRepository());

      const botData = await botController.getBotById(generateBot.client.id);

      botData.name = data.botName;

      await botController.createBot(botData);
    });

    // Finaliza a criação do bot (Avisa em caso de falha)
    generateBot.$onStop.subscribe(async (isConnected) => {
      if (!isConnected) {
        await cmd.sendMessage(`Houve uma falha na conexão do bot!!`);
      } else {
        await cmd.sendMessage("Bot configurado!!");

        const auth = new MultiFileAuthState(`${__dirname}/../../../sessions/${generateBot.client.id}`);

        BotController.startBot(generateBot.client.id, auth);
      }

      res(cmd.stopTasks());
    });

    // Inicia a geração do bot
    generateBot.start();
  });
});
