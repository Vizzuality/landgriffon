import { Injectable, NotFoundException } from '@nestjs/common';
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

import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { Brackets, SelectQueryBuilder, WhereExpressionBuilder } from 'typeorm';

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

    return await this.sourcingLocationRepository.saveChunks(sourcingLocation);
  }

  async findFilteredSourcingLocationsForIntervention(
    createInterventionDto: CreateScenarioInterventionDto,
  ): Promise<SourcingLocation[]> {
    const queryBuilder: SelectQueryBuilder<SourcingLocation> =
      this.sourcingLocationRepository
        .createQueryBuilder('sl')
        .select([
          'sl.materialId',
          'sl.businessUnitId',
          'sl.t1SupplierId',
          'sl.t1SupplierId',
          'sl.producerId',
          'sl.geoRegionId',
          'sl.adminRegionId',
          'sl.locationCountryInput',
          'sl.locationAddressInput',
          'sl.locationAddressInput',
          'sl.locationLongitude',
          'sl.locationLatitude',
          'sr.year',
          'sr.tonnage',
        ])
        .leftJoin('sl.sourcingRecords', 'sr')
        .where('sl."materialId" IN (:...materialIds)', {
          materialIds: createInterventionDto.materialIds,
        })
        .andWhere('sl."businessUnitId" IN (:...businessUnits)', {
          businessUnits: createInterventionDto.businessUnitIds,
        })
        .andWhere('sr.year >= :startYear', {
          startYear: createInterventionDto.startYear,
        })
        .andWhere('sl.adminRegionId IN (:...adminRegion)', {
          adminRegion: createInterventionDto.adminRegionIds,
        })
        .andWhere('sl.interventionType IS NULL');

    // Filter by suppliers if are provided. A user might not know from which provider gets some material
    if (createInterventionDto.supplierIds) {
      queryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('sl."t1SupplierId" IN (:...suppliers)', {
            suppliers: createInterventionDto.supplierIds,
          }).orWhere('sl."producerId" IN (:...suppliers)', {
            suppliers: createInterventionDto.supplierIds,
          });
        }),
      );
    }

    return queryBuilder.getMany();
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<SourcingLocation>,
    fetchSpecification: Record<string, unknown>,
  ): Promise<SelectQueryBuilder<SourcingLocation>> {
    query
      .where(`${this.alias}.scenarioInterventionId IS NULL`)
      .andWhere(`${this.alias}.interventionType IS NULL`);

    return query;
  }
}
