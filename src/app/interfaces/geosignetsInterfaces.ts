import { Coordinate } from 'ol/coordinate';
export interface GeosignetInterface {
  id?: number;
  coord: Coordinate;
  zoom: number;
  nom: string;
}
