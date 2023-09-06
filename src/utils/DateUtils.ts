export default class DateUtils {
  /**
   * Cria uma data no formato ISO
   * @param date Data que será retornada formatada
   * @returns Data formatada
   */
  public static ISO(date: Date | number | string = new Date(Date.now())): string {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/Sao_Paulo",
    };

    return new Date(date).toLocaleString("pt-BR", options).replace(",", "");
  }

  /**
   * Retorna o tempo real com anotaçoes (milesegundos | segundos | minutos | horas | dias)
   */
  public static formateTime(time: number): string {
    if (time < 1000) return `${time} milesegundo${time > 1 ? "s" : ""}`;
    if (time < 60000) return `${time / 1000} segundo${time > 1000 ? "s" : ""}`;
    if (time < 3600000) return `${time / 60000} minuto${time > 60000 ? "s" : ""}`;
    if (time < 86400000) return `${time / 3600000} hora${time > 3600000 ? "s" : ""}`;

    return `${time / 86400000} dia${time > 86400000 ? "s" : ""}`;
  }

  /**
   * Retorna o tempo em timestamp
   */
  public static getTimestampTime(time: number, type: "millisecond" | "second" | "minute" | "hour" | "day"): number {
    if (type === "day") return time * 86400000;
    if (type === "hour") return time * 3600000;
    if (type === "minute") return time * 60000;
    if (type === "second") return time * 1000;

    return time;
  }

  public static async sleep(timeout: number): Promise<void> {
    const result = timeout - 2147483647;

    if (result > 0) {
      await new Promise((res) => setTimeout(res, 2147483647));

      await DateUtils.sleep(result);

      return;
    }

    await new Promise((res) => setTimeout(res, timeout));
  }

  public static async sleepDate(date: Date | number): Promise<void> {
    if (date instanceof Date) {
      return await DateUtils.sleep(date.getTime() - Date.now());
    }

    return await DateUtils.sleep(date - Date.now());
  }
}
