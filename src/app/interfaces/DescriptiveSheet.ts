import { ShareServiceService } from './../services/share/share-service.service';
import { LayersInMap } from './layersInMapInterface';

export interface DescriptiveSheet {
  type: string;

  layer: LayersInMap;

  geometry?: any;

  properties: Object;
  coordinates_3857: [number, number];
  getShareUrl?: (
    environment,
    ShareServiceService: ShareServiceService
  ) => string;
}
