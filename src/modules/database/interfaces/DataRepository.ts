import DataModel from "@modules/database/interfaces/DataModel";

/**
 * Interface para repositórios de dados que permitem criar, ler, atualizar, excluir e restaurar dados.
 * @template T - Tipo do modelo de dados associado ao repositório.
 */
export default interface DataRepository<T extends DataModel> {
  /**
   * Cria um novo registro de dados.
   * @param data - Os dados a serem criados.
   * @throws Um erro caso ocorra algum problema durante a criação.
   */
  create(data: T): Promise<void>;

  /**
   * Lê um registro de dados com base em um modelo parcial.
   * @param data - O modelo parcial usado para buscar os dados.
   * @returns Os dados do registro lido.
   * @throws Um erro caso ocorra algum problema durante a leitura.
   */
  read(data: T): Promise<T>;

  /**
   * Atualiza os dados de um registro existente.
   * @param data - Os novos dados para atualização.
   * @throws Um erro caso ocorra algum problema durante a atualização.
   */
  update(data: Partial<T>): Promise<void>;

  /**
   * Exclui logicamente um registro de dados (desabilita).
   * @param data - O modelo de dados a ser desabilitado.
   * @throws Um erro caso ocorra algum problema durante a exclusão.
   */
  delete(data: T): Promise<void>;

  /**
   * Restaura um registro de dados previamente desabilitado.
   * @param data - O modelo de dados a ser restaurado.
   * @throws Um erro caso ocorra algum problema durante a restauração.
   */
  restore(data: T): Promise<void>;

  /**
   * Encontra e retorna todos os registros de dados com base nas chaves fornecidas.
   * @param keys - As chaves de pesquisa.
   * @returns Uma lista de registros de dados correspondentes.
   * @throws Um erro caso ocorra algum problema durante a busca.
   */
  findAll(...keys: string[]): Promise<T[]>;
}
