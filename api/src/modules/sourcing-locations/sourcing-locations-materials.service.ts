import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  SourcingLocation,
  sourcingLocationResource,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { UpdateSourcingLocationDto } from 'modules/sourcing-locations/dto/update.sourcing-location.dto';
import { SelectQueryBuilder } from 'typeorm';
import { SourcingLocationMaterial } from 'modules/sourcing-locations/dto/materials.sourcing-location.dto';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';

@Injectable()
export class SourcingLocationsMaterialsService extends AppBaseService<
  SourcingLocation,
  CreateSourcingLocationDto,
  UpdateSourcingLocationDto,
  AppInfoDTO
> {
  constructor(
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
        'material',
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

  async extendFindAllQuery(
    query: SelectQueryBuilder<SourcingLocation>,
    fetchSpecification: Record<string, unknown>,
  ): Promise<SelectQueryBuilder<SourcingLocation>> {
    const sortingOrder: 'DESC' | 'ASC' | undefined =
      fetchSpecification.order === 'desc' ? 'DESC' : 'ASC';

    query
      .select([
        `${this.alias}`,
        'material.id',
        'material.name',
        't1Supplier.name',
        'producer.name',
        'businessUnit.name',
        'sr',
      ])
      .innerJoin(`${this.alias}.material`, 'material')
      .leftJoin(`${this.alias}.t1Supplier`, 't1Supplier')
      .leftJoin(`${this.alias}.producer`, 'producer')
      .leftJoin(`${this.alias}.businessUnit`, 'businessUnit')
      .leftJoin(`${this.alias}.sourcingRecords`, 'sr')
      .where(`${this.alias}.scenarioInterventionId IS NULL`)
      .andWhere(`${this.alias}.interventionType IS NULL`);

    if (fetchSpecification.search) {
      query.andWhere('material.name ILIKE :search', {
        search: `%${fetchSpecification.search}%`,
      });
    }

    switch (fetchSpecification.orderBy) {
      case 'country':
        query.orderBy(`${this.alias}.locationCountryInput`, sortingOrder);
        break;
      case 'locationType':
        query.orderBy(`${this.alias}.locationType`, sortingOrder);
        break;
      case 'material':
      case 't1Supplier':
      case 'producer':
      case 'businessUnit':
        query.orderBy(`${fetchSpecification.orderBy}.name`, sortingOrder);
        break;
      default:
        query.orderBy('material.name', sortingOrder);
    }
    query.addOrderBy(`${this.alias}.id`);

    return query;
  }

  transformMaterialsListForResponse(
    sourcingLocation: SourcingLocation,
  ): SourcingLocationMaterial {
    const response: SourcingLocationMaterial = {
      material: sourcingLocation.material.name,
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
