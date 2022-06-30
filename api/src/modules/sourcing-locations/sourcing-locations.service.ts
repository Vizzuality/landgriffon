import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  LOCATION_TYPES_PARAMS,
  SourcingLocation,
  sourcingLocationResource,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { UpdateSourcingLocationDto } from 'modules/sourcing-locations/dto/update.sourcing-location.dto';

import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { Brackets, SelectQueryBuilder, WhereExpressionBuilder } from 'typeorm';
import {
  LocationTypesDto,
  LocationTypeWithLabel,
} from 'modules/sourcing-locations/dto/location-type.sourcing-locations.dto';
import { GetLocationTypesDto } from 'modules/sourcing-locations/dto/location-types-options.sourcing-locations.dto';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { MaterialsService } from 'modules/materials/materials.service';

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
    @Inject(forwardRef(() => AdminRegionsService))
    protected readonly adminRegionService: AdminRegionsService,
    @Inject(forwardRef(() => BusinessUnitsService))
    protected readonly businessUnitsService: BusinessUnitsService,
    @Inject(forwardRef(() => SuppliersService))
    protected readonly suppliersService: SuppliersService,
    @Inject(forwardRef(() => MaterialsService))
    protected readonly materialsService: MaterialsService,
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
    const sourcingLocations: SourcingLocation[] = sourcingLocationDTOs.map(
      (data: CreateSourcingLocationDto) => {
        const sourcingLocation: SourcingLocation = new SourcingLocation();
        Object.assign(sourcingLocation, data);
        return sourcingLocation;
      },
    );
    return await this.sourcingLocationRepository.saveChunks(sourcingLocations);
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
        .andWhere('sr.year >= :startYear', {
          startYear: createInterventionDto.startYear,
        })

        .andWhere('sl.interventionType IS NULL');

    // Optional filters:

    if (createInterventionDto.businessUnitIds)
      queryBuilder.andWhere('sl."businessUnitId" IN (:...businessUnits)', {
        businessUnits: createInterventionDto.businessUnitIds,
      });
    if (createInterventionDto.adminRegionIds)
      queryBuilder.andWhere('sl.adminRegionId IN (:...adminRegion)', {
        adminRegion: createInterventionDto.adminRegionIds,
      });
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

  async getLocationTypes(
    locationTypesOptions: GetLocationTypesDto,
  ): Promise<LocationTypesDto> {
    if (locationTypesOptions.originIds) {
      locationTypesOptions.originIds =
        await this.adminRegionService.getAdminRegionDescendants(
          locationTypesOptions.originIds,
        );
    }

    if (locationTypesOptions.materialIds) {
      locationTypesOptions.materialIds =
        await this.materialsService.getMaterialsDescendants(
          locationTypesOptions.materialIds,
        );
    }
    if (locationTypesOptions.businessUnitIds) {
      locationTypesOptions.businessUnitIds =
        await this.businessUnitsService.getBusinessUnitsDescendants(
          locationTypesOptions.businessUnitIds,
        );
    }
    if (locationTypesOptions.supplierIds) {
      locationTypesOptions.supplierIds =
        await this.suppliersService.getSuppliersDescendants(
          locationTypesOptions.supplierIds,
        );
    }

    const locationTypes: { locationType: string }[] =
      await this.sourcingLocationRepository.getAvailableLocationTypes(
        locationTypesOptions,
      );

    const parsedLocationTypes: LocationTypeWithLabel[] = locationTypes.map(
      (locationType: { locationType: string }) => {
        return {
          label:
            locationType.locationType
              .replace(/-/g, ' ')
              .charAt(0)
              .toUpperCase() +
            locationType.locationType.replace(/-/g, ' ').slice(1),
          value: locationType.locationType.replace(
            / /g,
            '-',
          ) as LOCATION_TYPES_PARAMS,
        };
      },
    );

    return { data: parsedLocationTypes };
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
