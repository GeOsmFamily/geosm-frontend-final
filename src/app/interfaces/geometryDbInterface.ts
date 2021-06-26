import { CoucheInterface } from './coucheInterface';

export interface ParametersGeometryDB {
  table: string;
  id: number;
  name: string;
}

export interface DownloadModelInterface {
  layers: Array<CoucheInterface>;

  roiType: 'all' | 'draw' | 'emprise';

  parametersGeometryDB?: ParametersGeometryDB;

  roiGeometry: any;
}
