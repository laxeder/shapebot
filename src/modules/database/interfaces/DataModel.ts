import { DataStatus } from "@modules/database/shared/DataStatus";

/**
 * Interface que define a estrutura básica dos dados.
 */
export default interface DataModel {
  /**
   * Identificador único dos dados.
   */
  id: string;

  /**
   * Status dos dados, indicando se está habilitado, desabilitado, etc.
   */
  status: DataStatus;

  /**
   * Data de criação dos dados.
   */
  createdAt: string;

  /**
   * Data da última atualização dos dados.
   */
  updatedAt: string;
}
