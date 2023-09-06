export default class ErrorUtils extends Error {
  /**
   * Retorna o nome do erro
   * @param err Erro
   * @returns Nome do erro
   */
  public static getErrorName(err: any): string {
    if (!(err instanceof Error)) {
      err = new Error(JSON.stringify(err, ["\n"], 2));
    }

    return `${err.name}`;
  }

  /**
   * Retorna a mensagem do erro
   * @param err Erro
   * @returns Mensagem do erro
   */
  public static getErrorMessage(err: any): string {
    if (!(err instanceof Error)) {
      err = new Error(JSON.stringify(err, ["\n"], 2));
    }

    return `${err.message}`;
  }

  /**
   * Retorna a stack do erro
   * @param err Erro
   * @returns Stack do erro
   */
  public static getStackError(err: any): string {
    if (!(err instanceof Error)) {
      err = new Error(JSON.stringify(err, ["\n"], 2));
    }

    return `${err.stack}`;
  }
}
