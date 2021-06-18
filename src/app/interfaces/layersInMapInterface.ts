import { ActiveLayersInterface } from './activeLayersInterface';
import { LegendCapabilitiesInterface } from './legendInterface';

export interface layersInMap {
  nom: string;
  type_layer:
    | 'geosmCatalogue'
    | 'draw'
    | 'mesure'
    | 'mappilary'
    | 'exportData'
    | 'other'
    | 'routing';
  image: string;
  properties: Object | null;
  zIndex: number;
  visible: boolean;
  data: any;
  /**
   * text and background color of the badje in the table of contents
   */
  badge?: {
    text: string;
    bgColor: string;
  };
  /**
   * The layer type OL/layer in the map
   */
  layer: any;
  /**
   * capabilities of the layer in toc. They user can set opactiy ? read metadata ?...
   * By default, all is set to true
   */
  activeLayers: ActiveLayersInterface;
  /**
   * capabilities of the layer legend. how to display legend of the layer ? with the url of a image ? with the legend of the carto server ?
   * by default this is none => no legend to display
   */
  legendCapabilities?: LegendCapabilitiesInterface;
  /**
   * description sheet capabilities
   */
  descriptionSheetCapabilities: 'osm';
}
