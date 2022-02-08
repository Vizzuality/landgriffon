import { Serializer } from 'jsonapi-serializer';
import * as JSONAPISerializer from 'jsonapi-serializer';
import {
  JSONAPISerializerConfig,
  PaginationMeta,
} from 'utils/app-base.service';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import {
  SourcingLocationMaterial,
  SourcingLocationsMaterialsResponseDto,
} from 'modules/sourcing-locations/dto/materials.sourcing-location.dto';

export class SourcingLocationsMaterialsSerializer {
  get serializerConfig(): JSONAPISerializerConfig<SourcingLocation> {
    return {
      attributes: [
        'materialName',
        'materialId',
        't1Supplier',
        'producer',
        'businessUnit',
        'country',
        'locationType',
        'purchases',
        'sr',
      ],
      keyForAttribute: 'camelCase',
      transform: this.transformMaterialsListForResponse,
    };
  }

  async serialize(
    entities:
      | Partial<SourcingLocation>
      | (Partial<SourcingLocation> | undefined)[],
    paginationMeta?: PaginationMeta,
  ): Promise<SourcingLocationsMaterialsResponseDto> {
    const serializer: Serializer = new JSONAPISerializer.Serializer(
      'Sourcing locations materials',
      {
        ...this.serializerConfig,
        meta: paginationMeta,
      },
    );

    return serializer.serialize(entities);
  }

  transformMaterialsListForResponse(
    sourcingLocation: SourcingLocation,
  ): SourcingLocationMaterial {
    const response: SourcingLocationMaterial = {
      materialName: sourcingLocation.material.name,
      materialId: sourcingLocation.material.id,
      producer: sourcingLocation.producer?.name || null,
      t1Supplier: sourcingLocation.t1Supplier?.name || null,
      businessUnit: sourcingLocation.businessUnit?.name,
      country: sourcingLocation.locationCountryInput,
      locationType: sourcingLocation.locationType,
      purchases: sourcingLocation.sourcingRecords.map((sr: SourcingRecord) => ({
        year: sr.year,
        tonnage: sr.tonnage,
      })),
    };

    return response;
  }
}
