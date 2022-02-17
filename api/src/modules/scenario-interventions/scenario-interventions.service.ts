import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  ScenarioIntervention,
  scenarioResource,
  SCENARIO_INTERVENTION_STATUS,
  SCENARIO_INTERVENTION_TYPE,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { ScenarioInterventionRepository } from 'modules/scenario-interventions/scenario-intervention.repository';
import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { UpdateScenarioInterventionDto } from 'modules/scenario-interventions/dto/update.scenario-intervention.dto';
import {
  SourcingLocation,
  TYPE_TO_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { getManager } from 'typeorm';
import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';

@Injectable()
export class ScenarioInterventionsService extends AppBaseService<
  ScenarioIntervention,
  CreateScenarioInterventionDto,
  UpdateScenarioInterventionDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(ScenarioInterventionRepository)
    protected readonly scenarioInterventionRepository: ScenarioInterventionRepository,
    protected readonly geoCodingService: GeoCodingService,
    protected readonly sourcingLocationsService: SourcingLocationsService,
  ) {
    super(
      scenarioInterventionRepository,
      scenarioResource.name.singular,
      scenarioResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<ScenarioIntervention> {
    return {
      attributes: [
        'title',
        'description',
        'status',
        'type',
        'createdAt',
        'updatedAt',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getScenarioInterventionById(id: number): Promise<ScenarioIntervention> {
    const found: ScenarioIntervention | undefined =
      await this.scenarioInterventionRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(
        `ScenarioIntervention with ID "${id}" not found`,
      );
    }

    return found;
  }

  async createScenarioIntervention(
    dto: CreateScenarioInterventionDto,
  ): Promise<any> {
    /**
     *  Creating New Intervention to be saved in scenario_interventions table
     */
    const newScenarioIntervention: ScenarioIntervention =
      new ScenarioIntervention();
    Object.assign(newScenarioIntervention, dto);
    /**
     * Getting Sourcing Locations and Sourcing Records for start year of all Materials of the intervention with applied filters
     */

    const actualSourcingDataWithTonnage: any[] =
      await this.findRequestedSourcingLocationsAndRecords(dto);
    /**
     * NEW SOURCING LOCATIONS #1 - Basically copies of the actual existing Sourcing Locations that will be replaced by intervention,
     * saved one more time but with the scenarioInterventionId and type 'CANCELED' related to intervention
     */

    // Creating array for new locations with intervention type CANCELED and reference to the new Intervention Id

    const newCancelledByInterventionLocations: CreateSourcingLocationDto[] =
      await this.createCanceledSourcingLocationsObjects(
        actualSourcingDataWithTonnage,
        newScenarioIntervention.id,
      );

    // Saving new Sourcing Locations with intervention type cancelled and reference to the new Intervention Id with start year record

    const cancelledInterventionSourcingLocations: SourcingLocation[] =
      await this.sourcingLocationsService.save(
        newCancelledByInterventionLocations,
      );

    // Adding relation to newly created cancelled Sourcing locations to New Intervention
    newScenarioIntervention.replacedSourcingLocations =
      cancelledInterventionSourcingLocations;

    /**
     * NEW SOURCING LOCATIONS #2 - The ones of the Intervention, will replace the CANCELED ones
     */

    switch (dto.type) {
      case SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL: {
        const geoCodedNewIntervention: any[] =
          await this.createReplacedMaterialSourcingLocationsObjects(
            dto,
            actualSourcingDataWithTonnage,
            newScenarioIntervention.id,
          );
        const newInterventionSourcingLocations: SourcingLocation[] =
          await this.sourcingLocationsService.save(geoCodedNewIntervention);
        newScenarioIntervention.newSourcingLocations =
          newInterventionSourcingLocations;
        break;
      }

      case SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER: {
        const newInterventionLocations: any[] =
          await this.createReplacedSupplierSourcingLocationsObjects(
            dto,
            actualSourcingDataWithTonnage,
            newScenarioIntervention.id,
          );

        const newInterventionSourcingLocations: SourcingLocation[] =
          await this.sourcingLocationsService.save(newInterventionLocations);

        newScenarioIntervention.newSourcingLocations =
          newInterventionSourcingLocations;

        break;
      }

      case SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY:
        {
          // scenarioIntervention = await this.createNewProductionEfficiencyIntervention(dto)
          return this.findRequestedSourcingLocationsAndRecords(dto);
          break;
        }

        /**
         * After both sets of new Sourcing Locations with Sourcing record for the start year has been created
         * and added as relations to the new Scenario Intervention, saving the new Scenario intervention in database
         */

        return newScenarioIntervention.save();
    }
  }

  async createReplacedMaterialSourcingLocationsObjects(
    dto: CreateScenarioInterventionDto,
    actualSourcingDataWithTonnage: any[],
    newScenarioInterventionId: string,
  ): Promise<any[]> {
    const tonnage: { volume: number } = actualSourcingDataWithTonnage.reduce(
      (a: any, b: any) => ({
        volume: a.tonnage + b.tonnage,
      }),
    );
    const newInterventionLocation: any[] = [
      {
        materialId: dto.newMaterialId,
        locationType: dto.newLocationType,
        locationAddressInput: dto.newAddressInput,
        locationCountryInput: dto.newCountryInput,
        t1SupplierId: dto.newSupplierT1Id,
        producerId: dto.newProducerId,
        businessUnitId: actualSourcingDataWithTonnage[0].businessUnitId,
        sourcingRecords: [{ year: dto.startYear, tonnage: tonnage.volume }],
      },
    ];

    const geoCodedNewInterventionLocation: any[] =
      await this.geoCodingService.geoCodeLocations(newInterventionLocation);

    geoCodedNewInterventionLocation[0].scenarioInterventionId =
      newScenarioInterventionId;
    geoCodedNewInterventionLocation[0].typeAccordingToIntervention =
      TYPE_TO_INTERVENTION.REPLACING;

    return geoCodedNewInterventionLocation;
  }

  async createReplacedSupplierSourcingLocationsObjects(
    dto: CreateScenarioInterventionDto,
    actualSourcingDataWithTonnage: any[],
    newScenarioInterventionId: string,
  ): Promise<any[]> {
    const locationSampleForGeoCoding: any[] = [
      {
        materialId: actualSourcingDataWithTonnage[0].materialId,
        locationType: dto.newLocationType,
        locationAddressInput: dto.newAddressInput,
        locationCountryInput: dto.newCountryInput,
        t1SupplierId: dto.newSupplierT1Id,
        producerId: dto.newSupplierT1Id,
        businessUnitId: actualSourcingDataWithTonnage[0].businessUnitId,
      },
    ];

    const geoCodedLocationSample: any[] =
      await this.geoCodingService.geoCodeLocations(locationSampleForGeoCoding);

    const newInterventionLocations: any[] = [];
    for (const location of actualSourcingDataWithTonnage) {
      const newInterventionLocation: any = {
        materialId: location.materialId,
        locationType: dto.newLocationType,
        locationAddressInput: dto.newAddressInput,
        locationCountryInput: dto.newCountryInput,
        t1SupplierId: dto.newSupplierT1Id,
        producerId: dto.newProducerId,
        businessUnitId: location.businessUnitId,
        geoRegionId: geoCodedLocationSample[0].geoRegionId,
        adminRegionId: geoCodedLocationSample[0].adminRegionId,
        sourcingRecords: [{ year: location.year, tonnage: location.tonnage }],
        scenarioInterventionId: newScenarioInterventionId,
        typeAccordingToIntervention: TYPE_TO_INTERVENTION.REPLACING,
      };

      newInterventionLocations.push(newInterventionLocation);
    }
    return newInterventionLocations;
  }

  async createCanceledSourcingLocationsObjects(
    sourcingData: any[],
    interventionId: string,
  ): Promise<CreateSourcingLocationDto[]> {
    const sourcingLocationsToSave: CreateSourcingLocationDto[] = [];

    for (const location of sourcingData) {
      const newCancelledInterventionLocation: any = {
        materialId: location.materialId,
        locationType: location.newLocationType,
        t1SupplierId: location.supplierT1Id,
        producerId: location.producerId,
        businessUnitId: location.businessUnitId,
        geoRegionId: location.geoRegionId,
        adminRegionId: location.adminRegionId,
        sourcingRecords: [
          {
            year: location.year,
            tonnage: location.tonnage,
          } as SourcingRecord,
        ],
        scenarioInterventionId: interventionId,
        typeAccordingToIntervention: TYPE_TO_INTERVENTION.CANCELED,
      };

      sourcingLocationsToSave.push(newCancelledInterventionLocation);
    }

    return sourcingLocationsToSave;
  }

  async findRequestedSourcingLocationsAndRecords(
    dto: CreateScenarioInterventionDto,
  ): Promise<SourcingLocation[]> {
    const sourcingLocations: SourcingLocation[] = await getManager()
      .createQueryBuilder()
      .select('sl.materialId', 'materialId')
      .addSelect('sl.businessUnitId', 'businessUnitId')
      .addSelect('sl.t1SupplierId', 't1SupplierId')
      .addSelect('sl.producerId', 'producerId')
      .addSelect('sl.geoRegionId', 'geoRegionId')
      .addSelect('sl.adminRegionId', 'adminRegionId')
      .addSelect('sr.year', 'year')
      .addSelect('SUM(sr.tonnage) as tonnage')
      .from(SourcingLocation, 'sl')
      .leftJoin('sourcing_records', 'sr', 'sr.sourcingLocationId = sl.id')
      .where('sl."materialId" IN (:...materialIds)', {
        materialIds: dto.materialsIds,
      })
      .andWhere('sl."t1SupplierId" IN (:...suppliers)', {
        suppliers: dto.suppliersIds,
      })
      .orWhere('sl."producerId" IN (:...suppliers)', {
        suppliers: dto.suppliersIds,
      })
      .andWhere('sl."producerId" IN (:...suppliers)', {
        suppliers: dto.suppliersIds,
      })
      .andWhere('sl."businessUnitId" IN (:...businessUnits)', {
        businessUnits: dto.businessUnitsIds,
      })
      .andWhere('sr.year = :startYear', { startYear: dto.startYear })
      .andWhere('sl.adminRegionId IN (:...adminRegion)', {
        adminRegion: dto.adminRegionsIds,
      })
      .getRawMany();

    return sourcingLocations;
  }
}
