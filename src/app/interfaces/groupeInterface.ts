import { CoucheInterface } from './coucheInterface';
import { SousThematiqueInterface } from './sousThematiqueInterface';

export interface GroupInterface {
  /**
   *  background color
   */
  color: string | null;
  /**
   * Name
   */
  nom: string;
  /**
   * Path to the icon
   */
  img: string;
}
/**
 * interface for classes that represent a thematique
 * @interface groupThematiqueInterface
 */
export interface GroupThematiqueInterface extends GroupInterface {
  id: number;
  /**
   * Identifiant in database
   */
  id_thematique: number;

  /**
   * Order to show
   */
  ordre: number;
  /**
   * shema in database
   */
  shema: string;
  /**
   * Sous thematiques
   */
  sous_thematiques: false | Array<SousThematiqueInterface>;
  /**
   * If sous_thematiques is false
   * Couches
   */
  couches?: Array<CoucheInterface>;
}
