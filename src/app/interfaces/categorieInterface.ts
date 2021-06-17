export interface CategorieInterface {
  /**
   * Select statement of the querry
   */
  select: string | null;
  /**
   * Is the querry OSM in plain text ?
   */
  mode_sql: boolean;
  /**
   * Where satement of the querry if mode_sql is true
   */
  sql_complete: null | string;
}
