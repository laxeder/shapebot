export default class TextUtils {
  constructor(public text: string = "") {}

  public clean(text: string = ""): this {
    this.text = text;

    return this;
  }

  public getText(): string {
    return this.text;
  }

  public add(text: string): this {
    this.text += `${text}`;

    return this;
  }

  public addLine(text: string = ""): this {
    this.text += `\n${text}`;

    return this;
  }

  public static bold(text: string): string {
    return `*${text}*`;
  }

  public static italic(text: string): string {
    return `_${text}_`;
  }

  public static lineDecorator(): string {
    return `\n▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔`;
  }

  public static getMoneyValue(value: number): string {
    let str = String(value).replace(".", ",");

    if (!str.includes(",")) str = `${str},00`;

    str = str
      .split(",")
      .map((s, i) => {
        if (i == 0) return s;
        if (s.length < 1) return "00";
        if (s.length < 2) return `${s}0`;
        return s;
      })
      .join(",");

    return str;
  }

  public static generateMoneyValue(value: string): number {
    const money = value
      .split(",")
      .slice(0, 2)
      .map((v) => v.replace(/\D+/g, "") || "0")
      .join(".");

    return Number(money || 0);
  }

  public static generateOptions(list: string[]): string {
    let text: string = "";

    list.forEach((item, index) => {
      text += `\n[${String(index + 1).padStart(2, "0")}] ${item}`;
    });

    return text.trim();
  }

  public static startsWith(str: string, value: string, ...ignored: string[]): boolean {
    if (!str.includes(value)) return false;

    for (const ignore of ignored) {
      if (ignore.includes(value)) return false;
    }

    return true;
  }

  public static isCanceled(text: string, ...ignored: string[]): boolean {
    const lower = text.toLowerCase().trim();

    if (TextUtils.startsWith(lower, "cancel", ...ignored)) return true;
    if (TextUtils.startsWith(lower, "sair", ...ignored)) return true;
    if (TextUtils.startsWith(lower, "termin", ...ignored)) return true;

    return false;
  }
}
