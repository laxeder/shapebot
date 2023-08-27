import { DataStatus } from "@modules/database/models/DataStatus";

export default interface DataModel {
  id: string;
  status: DataStatus;
  createdAt: string;
  updatedAt: string;
}
