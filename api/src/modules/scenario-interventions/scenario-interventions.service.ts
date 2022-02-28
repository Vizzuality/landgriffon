import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  CANCELED_OR_REPLACING_BY_INTERVENTION,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingLocationWithRecord } from 'modules/sourcing-locations/dto/sourcing-location-with-record.interface';
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
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
  ): Promise<ScenarioIntervention> {
    /**
     *  Creating New Intervention to be saved in scenario_interventions table
     */
    const newScenarioIntervention: ScenarioIntervention =
      new ScenarioIntervention();
    Object.assign(newScenarioIntervention, dto);
    await newScenarioIntervention.save();
    /**
     * Getting Sourcing Locations and Sourcing Records for start year of all Materials of the intervention with applied filters
     */

    const actualSourcingDataWithTonnage: SourcingLocationWithRecord[] =
      await this.sourcingLocationsService.findFilteredSourcingLocationsForIntervention(
        dto,
      );

    if (!actualSourcingDataWithTonnage.length) {
      throw new BadRequestException('No actual data for requested filters');
    }
    /**
     * NEW SOURCING LOCATIONS #1 - Basically copies of the actual existing Sourcing Locations that will be replaced by intervention,
     * saved one more time but with the scenarioInterventionId and type 'CANCELED' related to intervention
     */

    // Creating array for new locations with intervention type CANCELED and reference to the new Intervention Id

    const newCancelledByInterventionLocationsData: CreateSourcingLocationDto[] =
      await this.createSourcingLocationsObjectsForIntervention(
        actualSourcingDataWithTonnage,
        CANCELED_OR_REPLACING_BY_INTERVENTION.CANCELED,
      );

    // Saving new Sourcing Locations with intervention type canceled and reference to the new Intervention Id with start year record

    const cancelledInterventionSourcingLocations: SourcingLocation[] =
      await this.sourcingLocationsService.save(
        newCancelledByInterventionLocationsData,
      );

    newScenarioIntervention.replacedSourcingLocations =
      cancelledInterventionSourcingLocations;

    // TODO: Next step - calculate and save Impact Records for the newly created Sourcing Records, once calculation methodology is updated

    /**
     * NEW SOURCING LOCATIONS #2 - The ones of the Intervention, will replace the CANCELED ones
     * Depending on the intervention type
     */

    let newInterventionSourcingLocations: SourcingLocation[];

    switch (dto.type) {
      case SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL:
        const newMaterialInterventionLocation: SourcingData[] =
          await this.createSourcingLocationsDataForNewMaterialIntervention(
            dto,
            actualSourcingDataWithTonnage,
          );

        newInterventionSourcingLocations =
          await this.sourcingLocationsService.save(
            newMaterialInterventionLocation,
          );

        newScenarioIntervention.newSourcingLocations =
          newInterventionSourcingLocations;

        // TODO: Next step - calculate and save Impact Records for the newly created Sourcing Records, once calculation methodology is updated
        break;

      case SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER:
        const newSupplerInterventionLocations: SourcingData[] =
          await this.createSourcingLocationsDataForNewSupplierIntervention(
            dto,
            actualSourcingDataWithTonnage,
          );

        newInterventionSourcingLocations =
          await this.sourcingLocationsService.save(
            newSupplerInterventionLocations,
          );

        newScenarioIntervention.newSourcingLocations =
          newInterventionSourcingLocations;

        // TODO: Next step - calculate and save Impact Records for the newly created Sourcing Records, once calculation methodology is updated
        break;

      case SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY:
        const newEfficiencyChangeInterventionLocations: CreateSourcingLocationDto[] =
          await this.createSourcingLocationsObjectsForIntervention(
            actualSourcingDataWithTonnage,
            CANCELED_OR_REPLACING_BY_INTERVENTION.REPLACING,
          );

        newInterventionSourcingLocations =
          await this.sourcingLocationsService.save(
            newEfficiencyChangeInterventionLocations,
          );
        newScenarioIntervention.newSourcingLocations =
          newInterventionSourcingLocations;

        // TODO: Next step - calculate and save Impact Records once calculation methodology is updated
        break;
    }

    /**
     * After both sets of new Sourcing Locations with Sourcing Record (and Impact Records in the future) for the start year has been created
     * and added as relations to the new Scenario Intervention, saving the new Scenario intervention in database
     */

    return newScenarioIntervention.save();
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
    sourcingData: SourcingLocationWithRecord[],
  ): Promise<SourcingData[]> {
    const tonnage: number = sourcingData.reduce(
      (previous: any, current: any) => previous + Number(current.tonnage),
      0,
    );

    const newInterventionLocationDataForGeoCoding: SourcingData[] = [
      {
        materialId: dto.newMaterialId as string,
        locationType: dto.newLocationType,
        locationAddressInput: dto.newAddressInput,
        locationCountryInput: dto.newCountryInput,
        t1SupplierId: dto.newSupplierT1Id,
        producerId: dto.newProducerId,
        businessUnitId: sourcingData[0].businessUnitId,
        sourcingRecords: [{ year: dto.startYear, tonnage }],
      },
    ];

    const geoCodedNewInterventionLocation: SourcingData[] =
      await this.geoCodingService.geoCodeLocations(
        newInterventionLocationDataForGeoCoding,
      );

    const newSourcingLocationData: SourcingData[] = [
      {
        ...geoCodedNewInterventionLocation[0],
        ...{
          typeAccordingToIntervention:
            CANCELED_OR_REPLACING_BY_INTERVENTION.REPLACING,
        },
      },
    ];

    return newSourcingLocationData;
  }

  /**
   * In case of New Supplier Intervention , new 'replacing' Sourcing Location will be created for each of the canceled Sourcing Locations.
   * Each of the new Intervention's Sourcing Locations will have the same materialId as the relative canceled one, but all supplier location data will be new
   * (received from dto and geocoded to add new AdminRegion and GeoRegion)
   */

  async createSourcingLocationsDataForNewSupplierIntervention(
    dto: CreateScenarioInterventionDto,
    sourcingData: SourcingLocationWithRecord[],
  ): Promise<SourcingData[]> {
    const locationSampleForGeoCoding: SourcingData[] = [
      {
        materialId: sourcingData[0].materialId,
        locationType: dto.newLocationType,
        locationAddressInput: dto.newAddressInput,
        locationCountryInput: dto.newCountryInput,
        t1SupplierId: dto.newSupplierT1Id,
        producerId: dto.newSupplierT1Id,
        businessUnitId: sourcingData[0].businessUnitId,
        sourcingRecords: [
          {
            year: dto.startYear,
            tonnage: sourcingData[0].tonnage,
          },
        ],
      },
    ];

    const geoCodedLocationSample: SourcingData[] =
      await this.geoCodingService.geoCodeLocations(locationSampleForGeoCoding);

    const newSourcingLocationData: SourcingData[] = [];
    for (const location of sourcingData) {
      const newInterventionLocation: SourcingData = {
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
        typeAccordingToIntervention:
          CANCELED_OR_REPLACING_BY_INTERVENTION.REPLACING,
      };

      newSourcingLocationData.push(newInterventionLocation);
    }
    return newSourcingLocationData;
  }

  /**
   * This method is used when we need to generate the Sourcing Locations Data of type canceled or for Intervention type "Change production efficiency".
   * Canceled Sourcing Locations of the Intervention are 'copies' of the existing Sourcing Locations, found through dto filters received from user, but with reference to InterventionId
   * and intervention sourcing location type CANCELED
   * New Sourcing Locations of Intervention of type "Change production efficiency" have the same format (copies with references to intervention and type), since changes of the intervention
   * do not affect material, neither supplier location - changes of coefficients will be applied in the moment of calculating new impact of the Intervention
   */

  async createSourcingLocationsObjectsForIntervention(
    sourcingData: SourcingLocationWithRecord[],
    canceledOrReplacing: CANCELED_OR_REPLACING_BY_INTERVENTION,
  ): Promise<SourcingData[]> {
    const newSourcingLocationData: SourcingData[] = [];

    for (const location of sourcingData) {
      const newCancelledInterventionLocation: SourcingData = {
        materialId: location.materialId,
        locationType: location.locationType,
        t1SupplierId: location.t1SupplierId,
        producerId: location.producerId,
        businessUnitId: location.businessUnitId,
        geoRegionId: location.geoRegionId,
        adminRegionId: location.adminRegionId,
        sourcingRecords: [
          {
            year: location.year,
            tonnage: location.tonnage,
          },
        ],
        typeAccordingToIntervention: canceledOrReplacing,
      };

      newSourcingLocationData.push(newCancelledInterventionLocation);
    }

    return newSourcingLocationData;
  }
}
