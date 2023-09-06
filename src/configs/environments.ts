import dotenv from "dotenv";

dotenv.config();

/**
 * @param key chave
 * @returns retorna um valor dos enviroments
 */
export function getEnv(key: string): string {
  return String(process.env[key]);
}

/**
 * * Define um valor nos enviroments
 * @param key chave
 * @param value valor
 */
export function setEnv(key: string, value: string) {
  return (process.env[key] = value);
}

/**
 * @returns Retorna o ambiente
 */
export function getEnvironment(): string {
  return process.env.NODE_ENV?.trim() || "development";
}

/**
 * @returns Retorna a host do servidor
 */
export function getHost(): string {
  const HOST = getEnvironment() == "production" ? process.env.HOST : process.env.DEV_HOST;
  return HOST ? `${HOST}` : `http://localhost:${getPort()}`;
}

/**
 * @returns Retorna a porta do servidor
 */
export function getPort(): string {
  const PORT = getEnvironment() == "production" ? process.env.PORT : process.env.DEV_PORT;
  return PORT || "3000";
}

/**
 * @returns Retorna o tempo de desligamento gracioso
 */
export function getShutdown(): string {
  const SHUTDOWN = getEnvironment() == "production" ? process.env.SHUTDOWN : process.env.DEV_SHUTDOWN;
  return SHUTDOWN || "1s";
}
