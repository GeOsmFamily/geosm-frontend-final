import { Coordinate } from 'ol/coordinate';
import { Feature } from '../modules/ol';

export interface DataFromClickOnMapInterface {
  type: 'vector' | 'raster' | 'clear';
  data: {
    coord: Coordinate;
    layers: Array<any>;
    feature?: Feature;
    data?: {};
  };
}
