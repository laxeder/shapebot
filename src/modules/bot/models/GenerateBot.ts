import Client, { IClient, MultiFileAuthState, sleep, WAClient, WhatsAppBot } from "rompot";
import { Subject } from "rxjs";
import path from "path";
import fs from "fs";

import { getBaileysConfig } from "@configs/WAConfig";

import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";

import Logger from "@shared/Logger";

export default class GenerateBot {
  public $onQR: Subject<string> = new Subject();
  public $onOpen: Subject<void> = new Subject();
  public $onStop: Subject<boolean> = new Subject();

  constructor(public client: IClient) {
    this.$onStop.subscribe(async () => {
      await this.client.stop();

      await (this.client as WAClient).bot?.sock?.ws?.close();
    });
  }

  public async start(botId: string = `${Date.now()}`) {
    let isConnecting: boolean = false;

    this.client.on("qr", (qr) => {
      if (!isConnecting) {
        this.$onQR.next(qr);

        isConnecting = true;
      } else {
        this.$onStop.next(false);
      }
    });

    await this.client.connect(new MultiFileAuthState(`./sessions/${botId}`));

    this.$onOpen.next();

    const botController = new BotController(RepositoryUtils.getBotRepository());

    const botData = await botController.getBotById(this.client.id);

    await botController.createBot(botData);

    await sleep(10000);

    await this.client.stop();

    await sleep(3000);

    const sourceFolder = path.join(__dirname, "sessions", botId);
    const destinationFolder = path.join(__dirname, "sessions", botData.id);

    await this.moveFolder(sourceFolder, destinationFolder);

    this.$onStop.next(true);
  }

  public async moveFolder(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      // Verificar se o diretório de origem existe
      const sourceExists = await fs.promises.stat(sourcePath);
      if (!sourceExists.isDirectory()) {
        throw new Error(`O caminho "${sourcePath}" não é um diretório.`);
      }

      // Verificar se o diretório de destino existe
      const destinationExists = await fs.promises.stat(destinationPath).catch(() => null);
      if (destinationExists && !destinationExists.isDirectory()) {
        throw new Error(`O caminho "${destinationPath}" não é um diretório.`);
      }

      // Criar o diretório de destino se ele não existir
      if (!destinationExists) {
        await fs.promises.mkdir(destinationPath, { recursive: true });
      }

      // Ler o conteúdo do diretório de origem
      const folderContents = await fs.promises.readdir(sourcePath);

      // Mover cada arquivo ou subdiretório para o diretório de destino
      for (const content of folderContents) {
        const sourceContentPath = path.join(sourcePath, content);
        const destinationContentPath = path.join(destinationPath, content);
        await fs.promises.rename(sourceContentPath, destinationContentPath);
      }

      // Remover o diretório de origem vazio
      await fs.promises.rmdir(sourcePath);
    } catch (error) {
      const logger = new Logger();

      logger.error(error, "Erro ao mover a sessão");
    }
  }
}

if (process.argv.includes("--auto-start")) {
  const client = new Client(new WhatsAppBot({ ...getBaileysConfig(), printQRInTerminal: true }), {
    disableAutoCommand: true,
    disableAutoRead: true,
  });

  const generateBot = new GenerateBot(client);
  const logger = new Logger();

  generateBot.$onOpen.subscribe(() => {
    logger.botId = generateBot.client.id;

    logger.info(`Bot conectado com sucesso! (${generateBot.client.id})`);
    logger.info("Configurando bot...");
  });

  generateBot.$onStop.subscribe((isConnected) => {
    if (!isConnected) {
      logger.warn(`Houve uma falha na conexão do bot!!`);
    } else {
      logger.info("Bot configurado!!");
    }
  });

  logger.info("Escaneie o QR Code para gerar um novo bot");

  generateBot.start();
}
