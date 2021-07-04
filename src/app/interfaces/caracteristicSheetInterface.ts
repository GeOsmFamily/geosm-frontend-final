import { ShareServiceService } from '../services/share/share-service.service';
import { Map } from './../modules/ol';

export interface CaracteristicSheet {
  map: Map;
  url_share;
  properties: Object | any;
  geometry?: any;
  notif;
  getShareUrl?: (
    environment,
    ShareServiceService: ShareServiceService
  ) => string;
}
