export interface GeosignetsProjectInterface {
  /**
   * Is the geosignet active ?
   */
  active: boolean;
  geometry: string;
  /**
   * Id in DB
   */
  id: number;
  /**
   * Name
   */
  nom: string;
}
