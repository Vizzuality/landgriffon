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
import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';

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
    //   /**
    //    *  Creating New Intervention to be saved in scenario_interventions table
    //    */
    const newScenarioIntervention: ScenarioIntervention =
      new ScenarioIntervention();
    Object.assign(newScenarioIntervention, dto);
    await newScenarioIntervention.save();
    //   /**
    //    * Getting Sourcing Locations and Sourcing Records for start year of all Materials of the intervention with applied filters
    //    */

    const actualSourcingDataWithTonnage: any[] =
      await this.sourcingLocationsService.findFilteredSourcingLocationsForIntervention(
        dto,
      );
    //   /**
    //    * NEW SOURCING LOCATIONS #1 - Basically copies of the actual existing Sourcing Locations that will be replaced by intervention,
    //    * saved one more time but with the scenarioInterventionId and type 'CANCELED' related to intervention
    //    */

    // Creating array for new locations with intervention type CANCELED and reference to the new Intervention Id

    const newCancelledByInterventionLocations: CreateSourcingLocationDto[] =
      await this.createSourcingLocationsObjectsForIntervention(
        actualSourcingDataWithTonnage,
        newScenarioIntervention.id,
        TYPE_TO_INTERVENTION.CANCELED,
      );

    // Saving new Sourcing Locations with intervention type canceled and reference to the new Intervention Id with start year record

    const cancelledInterventionSourcingLocations: SourcingLocation[] =
      await this.sourcingLocationsService.save(
        newCancelledByInterventionLocations,
      );

    // // Adding relation to newly created cancelled Sourcing locations to New Intervention
    newScenarioIntervention.replacedSourcingLocations =
      cancelledInterventionSourcingLocations;

    /**
     * NEW SOURCING LOCATIONS #2 - The ones of the Intervention, will replace the CANCELED ones
     * Depending on the intervention type
     */

    switch (dto.type) {
      case SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL: {
        const geoCodedNewIntervention: any[] =
          await this.createSourcingLocationsDataForNewMaterialIntervention(
            dto,
            actualSourcingDataWithTonnage,
            newScenarioIntervention.id,
          );

        const newInterventionSourcingLocations: SourcingLocation[] =
          await this.sourcingLocationsService.save(geoCodedNewIntervention);
        newScenarioIntervention.newSourcingLocations =
          newInterventionSourcingLocations;
      }

      case SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER: {
        const newInterventionLocations: any[] =
          await this.createSourcingLocationsDataForNewSupplierIntervention(
            dto,
            actualSourcingDataWithTonnage,
            newScenarioIntervention.id,
          );

        const newInterventionSourcingLocations: SourcingLocation[] =
          await this.sourcingLocationsService.save(newInterventionLocations);

        newScenarioIntervention.newSourcingLocations =
          newInterventionSourcingLocations;
      }

      case SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY:
        {
          const newInterventionLocations: any[] =
            await this.createSourcingLocationsObjectsForIntervention(
              actualSourcingDataWithTonnage,
              newScenarioIntervention.id,
              TYPE_TO_INTERVENTION.REPLACING,
            );

          const newInterventionSourcingLocations: SourcingLocation[] =
            await this.sourcingLocationsService.save(newInterventionLocations);

          newScenarioIntervention.newSourcingLocations =
            newInterventionSourcingLocations;
        }

        /**
         * After both sets of new Sourcing Locations with Sourcing record for the start year has been created
         * and added as relations to the new Scenario Intervention, saving the new Scenario intervention in database
         */

        return newScenarioIntervention.save();
    }
  }

  /**
   * Following 3 methods are used to create an array of objects with properties of Sourcing locations, that later will be saved
   * in sourcing_locations table as the ones belonging to the intervention, representing:
   * - Sourcing Locations canceled by the Intervention (basically copies of the existing ones, requested by Intervention, but with reference to Intervention Id and type 'Cancelling..')
   * - Sourcing Location created by the Intervention, with alternative material / suppliers
   */

  /**
   * In case of New Material Intervention only 1 new Sourcing Location will be created, it will have the material, suppliers and supplier's location
   * received from user in create-intervention dto. However, the tonnage of the New Intervention must be taken as a sum of all tonnages of the Sourcing Locations
   * that are being canceled by the Intervention
   */
  async createSourcingLocationsDataForNewMaterialIntervention(
    dto: CreateScenarioInterventionDto,
    actualSourcingDataWithTonnage: any[],
    newScenarioInterventionId: string,
  ): Promise<any[]> {
    const tonnage: number = actualSourcingDataWithTonnage.reduce(
      (previous: any, current: any) => previous + Number(current.tonnage),
      0,
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
        sourcingRecords: [{ year: dto.startYear, tonnage }],
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

  /**
   * In case of New Supplier Intervention , new 'replacing' Sourcing Location will be created for each of the canceled Sourcing location.
   * Each of the new Sourcing location will have the same materialId as the relative  canceled one, but all supplier location data will be new
   * (received from dto and geocoded to add new AdminRegion and GeoRegion)
   */

  async createSourcingLocationsDataForNewSupplierIntervention(
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

  /**
   * This method is used when we need to create the Sourcing Locations of type canceled or for Intervention type "Change production efficiency".
   * Canceled Sourcing Locations of the Intervention are 'copies' of teh existing Sourcing Locations, found through dto filters received from user, but with reference to InterventionId
   * and intervention sourcing location type CANCELED
   * New Sourcing Locations of Intervention of type "Change production efficiency" have the same format (copies with references to intervention and type), since changes of the intervention
   * do not affect material, neither supplier location - changes of coefficients will be applied in the moment of calculating new impact of the i¡Intervention
   */

  async createSourcingLocationsObjectsForIntervention(
    sourcingData: any[],
    interventionId: string,
    cancelledOrReplacing: TYPE_TO_INTERVENTION,
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
        typeAccordingToIntervention: cancelledOrReplacing,
      };

      sourcingLocationsToSave.push(newCancelledInterventionLocation);
    }

    return sourcingLocationsToSave;
  }
}
