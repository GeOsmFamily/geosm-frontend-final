import { GroupInterface } from './groupeInterface';

export interface CarteInterface {
  /**
   * Extend of the layer if exists
   * @example "40.91789245605469,29.5161103,40.91789245605469,29.5161103"
   */
  bbox: string | null;
  /**
   * Is layer in map ?
   */
  check: boolean;
  commentaire: string;
  geom: null;
  /**
   * Identifiant for WMS/WMTS
   */
  identifiant: null;
  /**
   * Path for icon
   */
  image_src: string;
  /**
   * Should this map interrogeable with a  get feature info ?
   */
  interrogeable: boolean;
  /**
   * Id in DB
   */
  key_couche: number;
  /**
   * Metadata
   */
  metadata: Array<any>;
  /**
   * Name
   */
  nom: string;
  /**
   * is it the principal map of the apps ?
   */
  principal: boolean;
  /**
   * Projection
   */
  projection: string | null;
  /**
   * Method to render
   */
  type: 'xyz' | 'WMS' | 'PDF';
  /**
   * Url for wms/wmts
   */
  url: string;
  /**
   * Zoom max
   */
  zmax: string;
  /**
   * Zoom min
   */
  zmin: string;
}

// carteInterface.prototype['vv']=function () {
//   console.log('hh')
// }
/**
 * Interface for a sous carte
 * @interface sousCarteIntgerface
 */
export interface SousCarteIntgerface {
  active: false;
  couches: Array<CarteInterface>;
  id: number;
  /**
   * Id in DB
   */
  key: number;
  /**
   * Name
   */
  nom: string;
}

/**
 * interface for classes that represent a group of carte
 * @interface groupCarteInterface
 */
export interface GroupCarteInterface extends GroupInterface {
  id: number;
  /**
   * Identifiant in database
   */
  id_cartes: number;
  /**
   * Is this group the principal group of cartes
   */
  principal: boolean;
  /**
   * Sous thematiques
   */
  sous_cartes: false | Array<SousCarteIntgerface>;
  /**
   * If sous_cartes is false
   * Couches
   */
  couches?: Array<CarteInterface>;
}
