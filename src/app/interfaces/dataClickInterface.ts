import { Feature } from '../modules/ol';

export interface DataFromClickOnMapInterface {
  type: 'vector' | 'raster' | 'clear';
  data: {
    coord: [number, number];
    layers: Array<any>;
    feature?: Feature;
    /** additional data */
    data?: {};
  };
}
