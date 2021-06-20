import { Extent } from 'ol/extent';
import { GeosignetsProjectInterface } from './geosignetsInterface';
import { LimitesAdminstratives } from './limitesAdministrativesInterface';

export interface ConfigProjetInterface {
  /**
   * Extent of the project
   * Array of 4 length
   * @example [-6880641.45274482, -2438421.01533876, 6215722.16260819, 6675534.94618776]
   */
  bbox: Extent;
  /**
   * Geojson of the region of interest
   */
  roiGeojson: any;
  /**
   * Geographic limit of the project
   */
  limites: Array<LimitesAdminstratives>;
  /**
   * Geosignets of the projects
   */
  geosignetsProject: GeosignetsProjectInterface[];
}
