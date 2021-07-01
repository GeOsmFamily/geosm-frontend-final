import { ActiveLayersInterface } from './activeLayersInterface';
import { LegendCapabilitiesInterface } from './legendInterface';

export interface GeosmLayer {
  nom: string;
  /**
   * is the layer should appear in the toc ?
   */
  inToc: boolean;
  type_layer:
    | 'geosmCatalogue'
    | 'draw'
    | 'mesure'
    | 'mapillary'
    | 'exportData'
    | 'other'
    | 'routing';
  type: 'geojson' | 'wfs' | 'wms' | 'xyz';
  crs?: string;
  visible: boolean;
  strategy?: 'bbox' | 'all';
  load?: boolean;
  style?: any;
  maxzoom?: number;
  minzoom?: number;
  zindex?: number;
  size?: number;
  cluster?: boolean;
  icon?: string;
  iconImagette?: string;
  url?: string;
  identifiant?: string;
  /**
   * capabilities of the layer in toc. They user can set opactiy ? read metadata ?...
   * By default, all is set to true
   */
  activeLayers?: ActiveLayersInterface;
  /**
   * capabilities of the layer legend. how to display legend of the layer ? with the url of a image ? with the legend of the carto server ?
   * by default this is none => no legend to display
   */
  legendCapabilities?: LegendCapabilitiesInterface;
  properties:
    | {
        group_id: number;
        couche_id: number;
        type: 'couche' | 'carte';
      }
    | null
    | Object;
  descriptionSheetCapabilities: 'osm';
}
