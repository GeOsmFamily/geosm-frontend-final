import { Feature } from '../modules/ol';

export interface DrawToolInterace {
  active: boolean;
  features: Array<Feature>;
}

export interface ModifyToolTypeInterface {
  active: boolean;
}
export interface ModifyToolInterface {
  active: boolean;
  geometry: ModifyToolTypeInterface;
  comment: ModifyToolTypeInterface;
  color: ModifyToolTypeInterface;
  delete: ModifyToolTypeInterface;
  interactions: Array<any>;
  key: Array<any>;
}

export interface PropertiesFeatureInterface {
  comment: string;
  color: string;
  /**
   * id of feature
   */
  featureId: string;
}

export interface ModelOfDrawDataInDBInterface {
  comment: string;
  geom: Object;
  geometry: Array<any>;
  hexa_code: string;
  type: 'Point' | 'LineString' | 'Polygon' | 'Text';
}
