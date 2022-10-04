/**
 * Description of a base resource.
 *
 * Used in several places where there is a need to reference the class name of
 * the resource (e.g. `User`) or its singular or plural name (e.g. `user` and
 * `users`, respectively).
 *
 * @debt This should be moved to nestjs-base-service.
 */
export interface BaseServiceResource {
  /**
   * The name of the class for the resource entity.
   */
  className: string;

  /**
   * Names used to reference the entity, singular and plural.
   */
  name: { singular: string; plural: string };

  /**
   * Entities that can be included in requests
   */
  entitiesAllowedAsIncludes?: string[];

  /**
   * Controller-specific endpoint URL prefix.
   *
   * Most endpoint URLs are assembled from:
   * - versioned API prefix (e.g. `/api/v1`)
   * - controller-specific prefix (e.g. `geo-features`)
   * thus leading to a common prefix for all the endpoints of a controller such
   * as `/api/v1/geo-features/...`.
   */
  moduleControllerPrefix?: string;

  /**
   * List of entity fields that can be used as filters on the list endpoint
   */
  columnsAllowedAsFilter: string[];
}
