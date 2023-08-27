import DataModel from "./DataModel";

/**
 * Interface que define os métodos básicos que uma base de dados deve implementar.
 */
export default interface Database {
  /**
   * Salva os dados com a chave especificada.
   * @param key - A chave associada aos dados.
   * @param data - Os dados a serem salvos.
   */
  save(key: string, data: DataModel): Promise<void>;

  /**
   * Obtém os dados com base na chave e no ID fornecidos.
   * @param key - A chave associada aos dados.
   * @param id - O ID dos dados a serem obtidos.
   * @returns Os dados correspondentes ao ID especificado.
   */
  get(key: string, id: string): Promise<DataModel>;

  /**
   * Remove os dados com base na chave e no ID fornecidos.
   * @param key - A chave associada aos dados.
   * @param id - O ID dos dados a serem removidos.
   */
  remove(key: string, id: string): Promise<void>;

  /**
   * Obtém todos os dados associados à chave fornecida.
   * @param key - A chave associada aos dados.
   * @returns Uma lista de todos os dados correspondentes à chave.
   */
  findAll(key: string): Promise<DataModel[]>;
}
