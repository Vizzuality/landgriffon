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
import { SourcingLocationWithRecord } from 'modules/sourcing-locations/dto/sourcing-location-with-record.interface';
import { Brackets, WhereExpressionBuilder } from 'typeorm';

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

    return await this.sourcingLocationRepository.save(sourcingLocation as any);
  }

  async findFilteredSourcingLocationsForIntervention(
    createInterventionDto: CreateScenarioInterventionDto,
  ): Promise<SourcingLocationWithRecord[]> {
    const sourcingLocations: SourcingLocationWithRecord[] =
      await this.sourcingLocationRepository
        .createQueryBuilder('sl')
        .select('sl.materialId', 'materialId')
        .addSelect('sl.businessUnitId', 'businessUnitId')
        .addSelect('sl.t1SupplierId', 't1SupplierId')
        .addSelect('sl.producerId', 'producerId')
        .addSelect('sl.geoRegionId', 'geoRegionId')
        .addSelect('sl.adminRegionId', 'adminRegionId')
        .addSelect('sr.year', 'year')
        .addSelect('sr.tonnage', 'tonnage')
        .leftJoin('sourcing_records', 'sr', 'sr.sourcingLocationId = sl.id')
        .where('sl."materialId" IN (:...materialIds)', {
          materialIds: createInterventionDto.materialsIds,
        })
        .andWhere(
          new Brackets((qb: WhereExpressionBuilder) => {
            qb.where('sl."t1SupplierId" IN (:...suppliers)', {
              suppliers: createInterventionDto.suppliersIds,
            }).orWhere('sl."producerId" IN (:...suppliers)', {
              suppliers: createInterventionDto.suppliersIds,
            });
          }),
        )
        .andWhere('sl."businessUnitId" IN (:...businessUnits)', {
          businessUnits: createInterventionDto.businessUnitsIds,
        })
        .andWhere('sr.year=:startYear', {
          startYear: createInterventionDto.startYear,
        })
        .andWhere('sl.adminRegionId IN (:...adminRegion)', {
          adminRegion: createInterventionDto.adminRegionsIds,
        })
        .andWhere('sl.typeAccordingToIntervention IS NULL')
        .getRawMany();

    return sourcingLocations;
  }
}
