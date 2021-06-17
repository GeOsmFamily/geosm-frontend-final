export interface ClesValOsmInterface {
  /**
   * Key
   */
  action: string;
  /**
   * Condition
   */
  condition: 'AND' | 'OR';
  /**
   * Id in DB
   */
  id: number;
  /**
   * Id of the categorie
   */
  id_cat: number;
  /**
   * Value of the key
   */
  nom: string;
  /**
   * Operateur to compare key and action
   */
  operateur: number;
}
