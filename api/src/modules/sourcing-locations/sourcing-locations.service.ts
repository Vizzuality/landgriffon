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
export class SourcingLocationsService extends AppBaseService<
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
        'title',
        'locationType',
        'locationAccuracy',
        'sourcingLocationGroupId',
        'sourcingLocationGroup',
        'createdAt',
        'updatedAt',
        'metadata',
        'materialName',
        'materialId',
        't1Supplier',
        'producer',
        'businessUnit',
        'sourcingRecords',
        'locationCountryInput',
        'purchases',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getSourcingLocationById(id: number): Promise<SourcingLocation> {
    const found: SourcingLocation | undefined =
      await this.sourcingLocationRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(
        `Sourcing location with ID "${id}" not found`,
      );
    }

    return found;
  }

  async clearTable(): Promise<void> {
    await this.sourcingLocationRepository.delete({});
  }

  /**
   *
   * @debt Add proper input type when defined. Current workaround
   * 'SourcingData' mess with Entity typing
   */
  async save(
    sourcingLocationDTOs: CreateSourcingLocationDto[],
  ): Promise<SourcingLocation[]> {
    this.logger.log(`Saving ${sourcingLocationDTOs.length} nodes`);
    const sourcingLocation: SourcingLocation[] = await Promise.all(
      sourcingLocationDTOs.map(
        async (sourcingLocationDto: CreateSourcingLocationDto) => {
          return await this.setDataCreate(sourcingLocationDto);
        },
      ),
    );

    return await this.sourcingLocationRepository.save(sourcingLocation as any);
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
