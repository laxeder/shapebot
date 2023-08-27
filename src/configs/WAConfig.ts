import { WhatsAppBot } from "rompot";

export function getBaileysConfig(): WhatsAppBot["config"] {
  return { printQRInTerminal: false, qrTimeout: 120000 };
}
