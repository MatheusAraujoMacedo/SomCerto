import { Equipment } from "./equipment";
import { CrossoverSetting } from "./audio";

export interface AudioProject {
  id: string;
  name: string;
  vehicle: string;
  equipments: Equipment[];
  crossoverSettings?: CrossoverSetting[];
  createdAt: string;
  updatedAt: string;
}
