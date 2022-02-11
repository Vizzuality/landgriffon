import { ApiQuery } from '@nestjs/swagger';
import { DEFAULT_PAGINATION } from 'nestjs-base-service';
import { applyDecorators } from '@nestjs/common';

const includeQueryParam = (fetchConfiguration?: {
  entitiesAllowedAsIncludes?: string[];
}): MethodDecorator =>
  ApiQuery({
    name: 'include',
    description: fetchConfiguration?.entitiesAllowedAsIncludes?.length
      ? `A comma-separated list of relationship paths. Allows the client to customize which related resources should be returned. Allowed values are: ${fetchConfiguration.entitiesAllowedAsIncludes
          .map((i: string) => '`' + i + '`')
          .join(', ')}.`
      : 'A comma-separated list of relationship paths. Allows the client to customize which related resources should be returned.',
    type: String,
    required: false,
  });

const filterQueryParam = (fetchConfiguration?: {
  availableFilters?: {
    name: string;
    description?: string;
    examples?: string[];
  }[];
}): MethodDecorator =>
  ApiQuery({
    name: 'filter',
    description: fetchConfiguration?.availableFilters?.length
      ? `An array of filters (e.g. \`filter[keyA]=<value>&filter[keyB]=<value1>,<value2>...\`). Allows the client to request for specific filtering criteria to be applied to the request. Semantics of each set of filter key/values and of the set of filters as a whole depend on the specific request. Available filters: ${fetchConfiguration.availableFilters
          .map(
            (i: { name: string; description?: string; examples?: string[] }) =>
              '`' + i.name + '`',
          )
          .join(', ')}.`
      : 'An array of filters (e.g. `filter[keyA]=<value>&filter[keyB]=<value1>,<value2>...`). Allows the client to request for specific filtering criteria to be applied to the request. Semantics of each set of filter key/values and of the set of filters as a whole depend on the specific request.',
    type: String,
    isArray: true,
    required: false,
  });

const fieldsQueryParam: <T>(
  target: Record<string, any>,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void = ApiQuery({
  name: 'fields',
  description:
    'A comma-separated list that refers to the name(s) of the fields to be returned. An empty value indicates that all fields will be returned (less any fields specified as `omitFields`).',
  type: String,
  required: false,
});
const omitFieldsQueryParam: <T>(
  target: Record<string, any>,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void = ApiQuery({
  name: 'omitFields',
  description:
    'A comma-separated list that refers to the name(s) of fields to be omitted from the results. This could be useful as a shortcut when a specific field such as large geometry fields should be omitted, but it is not practical or not desirable to explicitly whitelist fields individually. An empty value indicates that no fields will be omitted (although they may still not be present in the result if an explicit choice of fields was provided via `fields`).',
  type: String,
  required: false,
});
const sortQueryParam: <T>(
  target: Record<string, any>,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void = ApiQuery({
  name: 'sort',
  description:
    'A comma-separated list of fields of the primary data according to which the results should be sorted. Sort order is ascending unless the field name is prefixed with a minus (for descending order).',
  type: String,
  required: false,
});
const pageSizeQueryParam: <T>(
  target: Record<string, any>,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void = ApiQuery({
  name: 'page[size]',
  description: `Page size for pagination. If not supplied, pagination with default page size of ${DEFAULT_PAGINATION.pageSize} elements will be applied.`,
  type: Number,
  required: false,
});
const pageNumberQueryParam: <T>(
  target: Record<string, any>,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void = ApiQuery({
  name: 'page[number]',
  description:
    'Page number for pagination. If not supplied, the first page of results will be returned.',
  type: Number,
  required: false,
});
const disablePaginationQueryParam: <T>(
  target: Record<string, any>,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void = ApiQuery({
  name: 'disablePagination',
  description: `If set to \`true\`, pagination will be disabled. This overrides any other pagination query parameters, if supplied.`,
  type: Boolean,
  required: false,
});

/**
 * Method decorator: convenience wrapper for OpenAPI annotations common to most
 * JSON:API plural GET endpoints.
 *
 * Wraps individual `@ApiQuery` decorators for these query parameters:
 * - include (https://jsonapi.org/format/1.0/#fetching-includes)
 * - fields (https://jsonapi.org/format/1.0/#fetching-sparse-fieldsets)
 * - omitFields (not part of the JSON:API specification)
 * - sort (https://jsonapi.org/format/1.0/#fetching-sorting)
 * - page[size] (https://jsonapi.org/format/1.0/#fetching-pagination)
 * - page[number] (https://jsonapi.org/format/1.0/#fetching-pagination)
 * - filter (https://jsonapi.org/format/1.0/#fetching-filtering)
 */
export const JSONAPIQueryParams = (fetchConfiguration?: {
  entitiesAllowedAsIncludes?: string[];
  availableFilters?: {
    name: string;
    description?: string;
    examples?: string[];
  }[];
}): MethodDecorator =>
  applyDecorators(
    includeQueryParam(fetchConfiguration),
    filterQueryParam(fetchConfiguration),
    fieldsQueryParam,
    omitFieldsQueryParam,
    sortQueryParam,
    pageSizeQueryParam,
    pageNumberQueryParam,
    disablePaginationQueryParam,
  );

/**
 * Method decorator: convenience wrapper for OpenAPI annotations common to most
 * JSON:API singular GET endpoints.
 *
 * Wraps individual `@ApiQuery` decorators for these query parameters:
 * - include (https://jsonapi.org/format/1.0/#fetching-includes)
 * - fields (https://jsonapi.org/format/1.0/#fetching-sparse-fieldsets)
 * - omitFields (not part of the JSON:API specification)
 */
export const JSONAPISingleEntityQueryParams = (fetchConfiguration?: {
  entitiesAllowedAsIncludes?: string[];
  availableFilters?: {
    name: string;
    description?: string;
    examples?: string[];
  }[];
}): MethodDecorator =>
  applyDecorators(
    includeQueryParam(fetchConfiguration),
    fieldsQueryParam,
    omitFieldsQueryParam,
  );

export const JSONAPIPaginationQueryParams = (): MethodDecorator =>
  applyDecorators(
    pageSizeQueryParam,
    pageNumberQueryParam,
    disablePaginationQueryParam,
  );
