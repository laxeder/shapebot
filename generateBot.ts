import Client, { MultiFileAuthState, sleep, WhatsAppBot } from "rompot";
import path from "path";
import fs from "fs";

import RepositoryUtils from "@modules/database/utils/RepositoryUtils";
import BotController from "@modules/bot/controllers/BotController";

import { getBaileysConfig } from "@configs/WAConfig";

import Logger from "@shared/Logger";

async function start() {
  const botId = `${Date.now()}`;

  Logger.info("Escaneie o QR Code para gerar um novo bot");

  const client = new Client(new WhatsAppBot({ ...getBaileysConfig(), printQRInTerminal: true }), {
    disableAutoCommand: true,
    disableAutoRead: true,
  });

  await client.connect(new MultiFileAuthState(`./sessions/${botId}`));

  Logger.info(`Bot conectado com sucesso! (${client.id})`);
  Logger.info("Espere alguns segundos para terminar de configurá-lo...");

  const botController = new BotController(RepositoryUtils.getBotRepository());

  const botData = await botController.getBotById(client.id);

  await botController.createBot(botData);

  await sleep(30000);

  await client.stop();

  await sleep(5000);

  const sourceFolder = path.join(__dirname, "sessions", botId);
  const destinationFolder = path.join(__dirname, "sessions", botData.id);

  await moveFolder(sourceFolder, destinationFolder);

  Logger.info("Bot configurado!!");
}

async function moveFolder(sourcePath: string, destinationPath: string): Promise<void> {
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
    Logger.error(error, "Erro ao mover a sessão");
  }
}

start();
