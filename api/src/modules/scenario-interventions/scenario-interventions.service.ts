import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  ScenarioIntervention,
  scenarioResource,
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
     * Depending on the type of scenario intervention - the dto should be processed by the relevant service.
     */

    switch (dto.type) {
      case SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL:
        // TODO
        break;

      case SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER:
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

        const newCancelledByInterventionLocations: any[] = [];

        for (const location of actualSourcingDataWithTonnage) {
          const newCancelledInterventionLocation: any = {
            materialId: location.materialId,
            locationType: dto.newLocationType,
            t1SupplierId: location.supplierT1Id,
            producerId: location.producerId,
            businessUnitId: location.businessUnitId,
            geoRegionId: location.geoRegionId,
            adminRegionId: location.adminRegionId,
            sourcingRecords: [
              { year: location.year, tonnage: location.tonnage },
            ],
            scenarioInterventionId: newScenarioIntervention.id,
            typeAccordingToIntervention: TYPE_TO_INTERVENTION.CANCELED,
          };

          newCancelledByInterventionLocations.push(
            newCancelledInterventionLocation,
          );
        }

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

        /* Since new SupplierLocation is the same for all the replaced Sourcing Locations/Records
           we can pass just 1 record with the Supplier Locations inputs through geoCodeLocations service
           to get geoRegionId and adminRegionId that will be the same in all newly created Sourcing Locations of the Intervention
        */

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
          await this.geoCodingService.geoCodeLocations(
            locationSampleForGeoCoding,
          );

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
            sourcingRecords: [
              { year: location.year, tonnage: location.tonnage },
            ],
            scenarioInterventionId: newScenarioIntervention.id,
            typeAccordingToIntervention: TYPE_TO_INTERVENTION.REPLACING,
          };

          newInterventionLocations.push(newInterventionLocation);
        }

        const newInterventionSourcingLocations: SourcingLocation[] =
          await this.sourcingLocationsService.save(newInterventionLocations);

        newScenarioIntervention.newSourcingLocations =
          newInterventionSourcingLocations;

        /**
         * After both sets of new Sourcing Locations with Sourcing record for the start year has been created
         * and added as relations to the new Scenario Intervention, saving the new Scenario intervention in database
         */

        newScenarioIntervention.save();

        break;

      case SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY:
        // scenarioIntervention = await this.createNewProductionEfficiencyIntervention(dto)
        return this.findRequestedSourcingLocationsAndRecords(dto);
        break;
    }
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
