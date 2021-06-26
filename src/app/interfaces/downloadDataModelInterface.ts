import { CoucheInterface } from './coucheInterface';
import { GroupThematiqueInterface } from './groupeInterface';

export interface DownloadDataModelInterface {
  index: number;
  nom: string;
  url: string;
  number: number;
  id: number;
  layer: CoucheInterface;
  groupThematique: GroupThematiqueInterface;
  empriseName;
}
