import { v4 as uuidv4 } from "uuid";

export default class IDUtils {
  public static generateNonce() {
    return `${Date.now()}${Math.floor(Math.random() * 100)}`;
  }

  public static generateUID() {
    return IDUtils.generateNonce();
  }

  public static generateCode(length: number = 6) {
    return [...IDUtils.generateNonce()].filter((_, i) => length - 6 < i).join("");
  }

  public static generateUUID(): string {
    return uuidv4();
  }
}
