import { Serializer } from 'jsonapi-serializer';
import * as JSONAPISerializer from 'jsonapi-serializer';
import {
  JSONAPISerializerConfig,
  PaginationMeta,
} from 'utils/app-base.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

// TODO: rename to something else
export class CustomSerializer {
  get serializerConfig(): JSONAPISerializerConfig<SourcingLocation> {
    return {
      attributes: [
        'materialName',
        'materialId',
        't1Supplier',
        'producer',
        'businessUnit',
        'locationCountryInput',
        'locationType',
        'purchases',
        'sr',
      ],
      keyForAttribute: 'camelCase',
      transform: this.transformMaterialsListForResponse,
    };
  }

  async serialize(
    entities: Partial<any> | (Partial<any> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<any> {
    const serializer: Serializer = new JSONAPISerializer.Serializer(
      'foo', // TODO: change to something else
      {
        ...this.serializerConfig,
        meta: paginationMeta,
      },
    );

    return serializer.serialize(entities);
  }

  transformMaterialsListForResponse(
    sourcingLocation: SourcingLocation,
  ): Record<string, any> {
    const response: Record<string, any> = {};

    response.materialName = sourcingLocation.material.name;
    response.materialId = sourcingLocation.material.id;
    response.producer = sourcingLocation.producer?.name;
    response.t1Supplier = sourcingLocation.t1Supplier?.name;
    response.businessUnit = sourcingLocation.businessUnit?.name;

    response.purchases = sourcingLocation.sourcingRecords.map(
      (sr: SourcingRecord) => ({
        year: sr.year,
        tonnage: sr.tonnage,
      }),
    );

    return response;
  }
}
