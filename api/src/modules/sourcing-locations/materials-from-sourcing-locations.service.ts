import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
  PaginationMeta,
} from 'utils/app-base.service';
import {
  SourcingLocation,
  sourcingLocationResource,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { UpdateSourcingLocationDto } from 'modules/sourcing-locations/dto/update.sourcing-location.dto';
import { FetchSpecification } from 'nestjs-base-service';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class MaterialsFromSourcingLocationsService extends AppBaseService<
  SourcingLocation,
  CreateSourcingLocationDto,
  UpdateSourcingLocationDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(SourcingLocationRepository)
    protected readonly sourcingLocationRepository: SourcingLocationRepository,
  ) {
    super(
      sourcingLocationRepository,
      sourcingLocationResource.name.singular,
      sourcingLocationResource.name.plural,
    );
  }

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
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getMaterialsFromSourcingLocations(
    fetchSpecification: FetchSpecification,
  ): Promise<{
    data: (Partial<SourcingLocation> | undefined)[];
    metadata: PaginationMeta | undefined;
  }> {
    const materialsListQuery: SelectQueryBuilder<SourcingLocation> =
      await this.sourcingLocationRepository.getSourcingLocationsMaterialsQuery();

    const paginatedListOfMaterials: {
      data: (Partial<SourcingLocation> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.paginateCustomQueryResults(
      materialsListQuery,
      fetchSpecification,
    );

    return this.transformMaterialsListForResponse(paginatedListOfMaterials);
  }

  async transformMaterialsListForResponse(materialsList: any): Promise<{
    data: (Partial<SourcingLocation> | undefined)[];
    metadata: PaginationMeta | undefined;
  }> {
    for (const obj of materialsList.data) {
      obj.materialName = obj.material.name;
      obj.materialId = obj.material.id;
      obj.producer = obj.producer ? obj.producer.name : null;
      obj.t1Supplier = obj.t1Supplier ? obj.t1Supplier.name : null;
      obj.businessUnit = obj.businessUnit ? obj.businessUnit.name : null;

      const purchases: { year: number; tonnage: number }[] = [];
      for (const sr of obj.sourcingRecords) {
        purchases.push({ year: sr.year, tonnage: sr.tonnage });
      }
      obj.purchases = purchases;
      delete obj.sourcingRecords;
    }

    return materialsList;
  }
}
