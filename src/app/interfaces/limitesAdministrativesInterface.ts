export interface LimitesAdminstratives {
  /**
   * Id in DB
   */
  id_limite: number;
  /**
   * Id of the associated couche
   */
  key_couche: number;
  /**
   * Name
   */
  nom: string;
  /**
   * Name of the table in DB
   */
  nom_table: string;
  /**
   * Is the associated couche in a sous thematique ?
   */
  sous_thematiques: boolean;
}
