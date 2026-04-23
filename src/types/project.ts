import { Equipment } from "./equipment";

export interface AudioProject {
  id: string;
  name: string;
  vehicle: string;
  equipments: Equipment[];
  createdAt: string;
  updatedAt: string;
}
