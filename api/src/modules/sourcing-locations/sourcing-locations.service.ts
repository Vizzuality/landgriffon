import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  LOCATION_TYPES,
  SourcingLocation,
  sourcingLocationResource,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { UpdateSourcingLocationDto } from 'modules/sourcing-locations/dto/update.sourcing-location.dto';

import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { SelectQueryBuilder } from 'typeorm';
import {
  LocationTypesDto,
  LocationTypeWithLabel,
} from 'modules/sourcing-locations/dto/location-type.sourcing-locations.dto';
import { GetLocationTypesDto } from 'modules/sourcing-locations/dto/location-types-options.sourcing-locations.dto';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { MaterialsService } from 'modules/materials/materials.service';
import {
  locationTypeParser,
  toLocationType,
} from 'modules/sourcing-locations/helpers/location-type.parser';
import { SourcingDataImportProgressTracker } from './progress-tracker/sourcing-data.progress-tracker';
import { ImportProgressTrackerFactory } from 'modules/events/import-data/import-progress.tracker.factory';

@Injectable()
export class SourcingLocationsService extends AppBaseService<
  SourcingLocation,
  CreateSourcingLocationDto,
  UpdateSourcingLocationDto,
  AppInfoDTO
> {
  constructor(
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

  async getSourcingLocationById(id: string): Promise<SourcingLocation> {
    const found: SourcingLocation | null =
      await this.sourcingLocationRepository.findOne({ where: { id } });

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

  /**
   * @description: Find Sourcing Locations and their Sourcing Records applying the filter
   * @param createInterventionDto
   */

  async findSourcingLocationsWithSourcingRecords(
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
          'sl.locationType',
          'sr.year',
          'sr.tonnage',
          'ir.value',
          'ir.scaler',
          'ir.indicatorId',
          'ir.materialH3DataId',
        ])
        .leftJoin('sl.sourcingRecords', 'sr')
        .leftJoin('sr.indicatorRecords', 'ir')
        .where('sl."materialId" IN (:...materialIds)', {
          materialIds: createInterventionDto.materialIds,
        })
        .andWhere('sr.year >= :startYear', {
          startYear: createInterventionDto.startYear,
        })

        .andWhere('sl.interventionType IS NULL')
        .andWhere('sl.scenarioInterventionId IS NULL');

    // Optional filters:

    if (createInterventionDto.businessUnitIds?.length)
      queryBuilder.andWhere('sl."businessUnitId" IN (:...businessUnits)', {
        businessUnits: createInterventionDto.businessUnitIds,
      });
    if (createInterventionDto.adminRegionIds?.length)
      queryBuilder.andWhere('sl.adminRegionId IN (:...adminRegion)', {
        adminRegion: createInterventionDto.adminRegionIds,
      });
    if (createInterventionDto.t1SupplierIds?.length) {
      queryBuilder.andWhere('sl."t1SupplierId" IN (:...suppliers)', {
        suppliers: createInterventionDto.t1SupplierIds,
      });
    }
    if (createInterventionDto.producerIds?.length) {
      queryBuilder.andWhere('sl."producerId" IN (:...producers)', {
        producers: createInterventionDto.producerIds,
      });
    }

    return queryBuilder.getMany();
  }

  async getLocationTypes(
    locationTypesOptions: GetLocationTypesDto,
  ): Promise<LocationTypesDto> {
    if (locationTypesOptions.supported) {
      return this.getAllSupportedLocationTypes({
        sort: locationTypesOptions.sort ?? 'DESC',
      });
    }
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

    const locationTypes: { locationType: string }[] =
      await this.sourcingLocationRepository.getAvailableLocationTypes(
        locationTypesOptions,
      );

    const parsedLocationTypes: LocationTypeWithLabel[] =
      locationTypeParser(locationTypes);

    return { data: parsedLocationTypes };
  }

  async extendFindAllQuery(
    query: SelectQueryBuilder<SourcingLocation>,
  ): Promise<SelectQueryBuilder<SourcingLocation>> {
    query
      .where(`${this.alias}.scenarioInterventionId IS NULL`)
      .andWhere(`${this.alias}.interventionType IS NULL`);

    return query;
  }

  /**
   * @description Returns a hardcoded list of all location types supported by the platform
   */
  getAllSupportedLocationTypes(options: { sort?: 'ASC' | 'DESC' }): any {
    const locationTypes: { locationType: string }[] = Object.values(
      LOCATION_TYPES,
    )
      .map((locationType: string) => ({ locationType }))
      .sort((a: { locationType: string }, b: { locationType: string }) => {
        const comparison: number =
          a.locationType.toLowerCase() < b.locationType.toLowerCase() ? -1 : 1;
        return options.sort === 'DESC' ? comparison : comparison * -1;
      });

    return { data: locationTypeParser(locationTypes) };
  }

  async findByGeoRegionId(
    geoRegionId: string,
  ): Promise<SourcingLocation | null> {
    return this.sourcingLocationRepository.findOne({ where: { geoRegionId } });
  }

  async getAvailableLocationTypes(
    dto: GetLocationTypesDto,
  ): Promise<LOCATION_TYPES[]> {
    const locationTypes: { locationType: string }[] =
      await this.sourcingLocationRepository.getAvailableLocationTypes(dto);

    return locationTypes.map((value: { locationType: string }) =>
      toLocationType(value.locationType),
    );
  }
}
