export interface ResponseOfSerachLimitInterface {
  /**
   * DB table corresponding
   */
  table: string;
  /**
   * id DB of in the table
   */
  id: number;
  /**
   * name of the limit
   */
  limitName: string;
  /**
   * name
   */
  name: string;
  ref: string;
  geometry?: any;
}
