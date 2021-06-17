import { CategorieInterface } from './categorieInterface';
import { ClesValOsmInterface } from './cleValOsmInterface';

export interface CoucheInterface {
  /**
   * Extend of the layer if exists
   * @example "40.91789245605469,29.5161103,40.91789245605469,29.5161103"
   */
  bbox: string | null;
  /**
   * categorie of the layer
   */
  categorie: CategorieInterface;
  /**
   * Is the layer in map ?
   */
  check: boolean;
  /**
   * Only if wms_type is OSM and categorie.mode_sql is false
   * Expressions to define the querry for OSM
   */
  cles_vals_osm: Array<ClesValOsmInterface> | null;
  colonnes: Array<{ nom: string; champ: string }>;
  contour_couleur: null;
  /**
   * total lenght of the data. If geom is  LineString
   */
  distance_totale: string | null;
  file_json: null;
  /**
   * Geometry type
   */
  geom: 'point' | 'Polygon' | 'LineString';
  /**
   * Categorie ID in DB
   */
  id_cat: number;
  /**
   * Table in DB
   */
  id_couche: string;
  /**
   * Identifiant in QGIS SERVER for WFS/WMS/WMTS
   */
  identifiant: string;
  /**
   * Path for icon type circular
   */
  img: string;
  /**
   * Id in DB
   */
  key_couche: number;
  /**
   * Path for icon type  square
   */
  logo_src: string | null;
  /**
   * Metadata
   */
  metadata: Array<any>;
  /**
   * name
   */
  nom: string;
  /**
   * Number of data in layer
   */
  number: number;
  opacity: null;
  params_files: {
    /**
     * Name of the categorie
     */
    nom_cat: string;
    /**
     * Is layer in a sous thematique ?
     */
    sous_thematiques: boolean;
    /**
     * Id of the couche in DB
     */
    key_couche: number;
    /**
     * id categorie
     */
    id_cat: number;
  };
  /**
   * Projection of the layer
   */
  projection: null;
  remplir_couleur: null;
  status: false;
  /**
   * total area of the data. If geom is  Polygon
   */
  surface_totale: number | null;
  /**
   * Method to render layer
   */
  type_couche: 'wms' | 'wfs';
  /**
   * render layer in wms ?, if false, render layer in wfs
   */
  service_wms: boolean;
  /**
   * Url of QGIS SERVER
   */
  url: string;
  /**
   * If data is from OSM
   */
  wms_type: 'osm' | null;
  /**
   * Zoom max
   */
  zmax: number;
  /**
   * Zoom min
   */
  zmin: number;
}
