import { CoucheInterface } from './coucheInterface';

export interface SousThematiqueInterface {
  active: boolean;
  /**
   * The layers
   */
  couches: Array<CoucheInterface>;
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
