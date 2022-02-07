import {
  BaseService,
  DEFAULT_PAGINATION,
  FetchSpecification,
} from 'nestjs-base-service';

import * as JSONAPISerializer from 'jsonapi-serializer';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Serializer } from 'jsonapi-serializer';

export class PaginationMeta {
  totalPages: number;
  totalItems: number;
  size: number;
  page: number;

  constructor(paginationMeta: {
    totalPages: number;
    totalItems: number;
    size: number;
    page: number;
  }) {
    this.totalItems = paginationMeta.totalItems;
    this.totalPages = paginationMeta.totalPages;
    this.size = paginationMeta.size;
    this.page = paginationMeta.page;
  }
}

/**
 * The part of the configuration object for jsonapi-serializer concerned with
 * serializable properties.
 *
 * We handle this separately (while leaving the rest of the config object
 * loosely typed as Record<string, unknown>) so that we can start to
 * incrementally make typing stricter where this can be more useful to catch
 * accidental mistakes (configuring the entity's own serializable properties).
 */
export interface JSONAPISerializerAttributesConfig<Entity> {
  attributes: string[];
  /**
   * Approximate typing from jsonapi-serializer's documentation
   * (https://github.com/SeyZ/jsonapi-serializer#available-serialization-option-opts-argument),
   * but in practice we should only use `camelCase` in this project.
   */
  keyForAttribute:
    | string
    | (() => string)
    | 'lisp-case'
    | 'spinal-case'
    | 'kebab-case'
    | 'underscore_case'
    | 'snake_case'
    | 'camelCase'
    | 'CamelCase';
}

export type JSONAPISerializerConfig<Entity> =
  JSONAPISerializerAttributesConfig<Entity> & Record<string, unknown>;

export abstract class AppBaseService<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Entity extends object,
  CreateModel,
  UpdateModel,
  Info,
> extends BaseService<Entity, CreateModel, UpdateModel, Info> {
  constructor(
    protected readonly repository: Repository<Entity>,
    protected alias: string = 'base_entity',
    protected pluralAlias: string = 'base_entities',
    protected idProperty: string = 'id',
  ) {
    super(repository, alias, { idProperty });
  }

  /**
   * @debt Add proper typing.
   */
  abstract get serializerConfig(): JSONAPISerializerConfig<Entity>;

  async serialize(
    entities: Partial<Entity> | (Partial<Entity> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    const serializer: Serializer = new JSONAPISerializer.Serializer(
      this.pluralAlias,
      {
        ...this.serializerConfig,
        meta: paginationMeta,
      },
    );

    return serializer.serialize(entities);
  }

  /**
   * Curried wrapper for findAllPaginated(), defaulting to requesting raw
   * results rather than entities.
   */
  async findAllPaginatedRaw(
    fetchSpecification?: FetchSpecification,
    info?: Info,
  ): Promise<{
    data: (Partial<Entity> | undefined)[];
    metadata: PaginationMeta | undefined;
  }> {
    const entitiesAndCount: [Partial<Entity>[], number] = await this.findAllRaw(
      fetchSpecification,
      info,
    );
    return this._paginate(entitiesAndCount, fetchSpecification);
  }

  async findAllPaginated(
    fetchSpecification?: FetchSpecification,
    info?: Info,
  ): Promise<{
    data: (Partial<Entity> | undefined)[];
    metadata: PaginationMeta | undefined;
  }> {
    const entitiesAndCount: [Partial<Entity>[], number] = await this.findAll(
      fetchSpecification,
      info,
    );
    return this._paginate(entitiesAndCount, fetchSpecification);
  }

  async paginateCustomQueryResults(
    query: SelectQueryBuilder<Entity>,
    fetchSpecification?: FetchSpecification,
  ): Promise<{
    data: (Partial<Entity> | undefined)[];
    metadata: PaginationMeta | undefined;
  }> {
    const totalAmountOfEntities: number = (await query.getMany()).length;
    const pageSize: number = fetchSpecification?.pageSize || 25;
    const pageNumber: number = fetchSpecification?.pageNumber || 1;

    const entities: any = await query
      .take(pageSize || 25)
      .skip(pageSize * (pageNumber - 1))
      .getMany();

    return this._paginate(
      [entities, totalAmountOfEntities],
      fetchSpecification,
    );
  }

  private _paginate(
    entitiesAndCount: [Partial<Entity>[], number],
    fetchSpecification?: FetchSpecification,
  ): {
    data: (Partial<Entity> | undefined)[];
    metadata: PaginationMeta | undefined;
  } {
    const totalItems: number = entitiesAndCount[1];
    const entities: Partial<Entity>[] = entitiesAndCount[0];
    const pageSize: number =
      fetchSpecification?.pageSize ?? DEFAULT_PAGINATION.pageSize ?? 25;
    const page: number =
      fetchSpecification?.pageNumber ?? DEFAULT_PAGINATION.pageNumber ?? 1;
    const disablePagination: boolean | undefined =
      fetchSpecification?.disablePagination;
    const meta: PaginationMeta | undefined = disablePagination
      ? undefined
      : new PaginationMeta({
          totalPages: Math.ceil(totalItems / pageSize),
          totalItems,
          size: pageSize,
          page,
        });

    return { data: entities, metadata: meta };
  }
}

export class JSONAPIEntityData {
  @ApiProperty()
  type: string = 'base';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes: any;
}

export class EntityResult {
  @ApiProperty()
  data!: JSONAPIEntityData;
}
