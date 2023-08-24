import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  SCENARIO_INTERVENTION_TYPE,
  ScenarioIntervention,
  scenarioResource,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { ScenarioInterventionRepository } from 'modules/scenario-interventions/scenario-intervention.repository';
import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { UpdateScenarioInterventionDto } from 'modules/scenario-interventions/dto/update.scenario-intervention.dto';
import {
  SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { GeoCodingAbstractClass } from 'modules/geo-coding/geo-coding-abstract-class';
import { InterventionBuilder } from 'modules/scenario-interventions/services/intervention-builder.service';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { InsertResult } from 'typeorm';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';

@Injectable()
export class ScenarioInterventionsService extends AppBaseService<
  ScenarioIntervention,
  CreateScenarioInterventionDto,
  UpdateScenarioInterventionDto,
  AppInfoDTO
> {
  private basicUpdateColumns: string[] = [
    'title',
    'description',
    'updatedById',
    'status',
  ];

  constructor(
    protected readonly scenarioInterventionRepository: ScenarioInterventionRepository,
    protected readonly interventionBuilder: InterventionBuilder,
    protected readonly geoCodingService: GeoCodingAbstractClass,
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
        'startYear',
        'type',
        'createdAt',
        'updatedAt',
        'scenario',
        'newLocationType',
        'newIndicatorCoefficients',
        'newLocationCountryInput',
        'newLocationAddressInput',
        'newLocationLatitudeInput',
        'newLocationLongitudeInput',
        'replacedMaterials',
        'replacedBusinessUnits',
        'replacedAdminRegions',
        'replacedT1Suppliers',
        'replacedProducers',
        'newMaterial',
        'newBusinessUnit',
        'newAdminRegion',
        'newT1Supplier',
        'newProducer',
        'percentage',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getScenarioInterventionById(id: string): Promise<ScenarioIntervention> {
    const found: ScenarioIntervention | null =
      await this.scenarioInterventionRepository.findOne({ where: { id } });

    if (!found) {
      throw new NotFoundException(
        `ScenarioIntervention with ID "${id}" not found`,
      );
    }

    return found;
  }

  async getScenarioInterventionsByScenarioId(
    scenarioId: string,
  ): Promise<ScenarioIntervention[]> {
    return this.scenarioInterventionRepository.getScenarioInterventionsByScenarioId(
      scenarioId,
    );
  }

  async createScenarioIntervention(
    dto: CreateScenarioInterventionDto,
  ): Promise<Partial<ScenarioIntervention>> {
    // Validate new location. If it's validated, get the geolocated info. If not, throw an exception

    this.logger.log('Creating new Intervention...');

    const { adminRegionId, geoRegionId, locationWarning } =
      await this.validateNewLocation(dto as CreateScenarioInterventionDto);
    /**
     *  Getting descendants of adminRegions, materials, suppliers adn businessUnits received as filters, if exists
     */

    const dtoWithDescendants: CreateScenarioInterventionDto =
      await this.interventionBuilder.addDescendantsEntitiesForFiltering(
        dto as CreateScenarioInterventionDto,
      );
    /**
     * Getting Sourcing Locations and Sourcing Records and Indicator records
     * for start year of all Materials of the intervention with applied filters
     */
    const actualSourcingDataWithTonnage: SourcingLocation[] =
      await this.sourcingLocationsService.findSourcingLocationsWithSourcingRecords(
        dtoWithDescendants,
      );

    if (!actualSourcingDataWithTonnage.length) {
      throw new BadRequestException('No actual data for requested filters');
    }

    /**
     * Mutates the Actual Sourcing Locations, Applying percentage received from user to the volume of tonnes of filter-matching Sourcing Locations
     * and to values of Indicator Records
     */

    this.interventionBuilder.applySelectedPercentage(
      actualSourcingDataWithTonnage,
      dto.percentage,
    );

    /*
     * NEW SOURCING LOCATIONS #1 - Basically copies of the actual existing Sourcing Locations that will be replaced by intervention,
     * saved one more time but with the scenarioInterventionId and type 'CANCELED' related to intervention
     */

    // Creating array for new locations with intervention type CANCELED and reference to the new Intervention Id

    const newCancelledByInterventionLocationsData: SourcingLocation[] =
      await this.createNewSourcingLocationsForIntervention(
        actualSourcingDataWithTonnage,
        SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
      );

    /**
     *  Creating New Intervention to be saved in scenario_interventions table
     */

    const newIntervention: ScenarioIntervention =
      ScenarioInterventionsService.createInterventionInstance(
        dto as CreateScenarioInterventionDto,
      );

    //Mutates the intervention instance adding replaced Entities to new Scenario Intervention

    await this.interventionBuilder.addReplacedElementsToIntervention(
      newIntervention,
      newCancelledByInterventionLocationsData,
      dto as CreateScenarioInterventionDto,
    );

    const newLocations: SourcingLocation[] =
      await this.interventionBuilder.generateNewLocationsForIntervention(
        dto as CreateScenarioInterventionDto,
        newIntervention,
        actualSourcingDataWithTonnage,
        { adminRegionId, geoRegionId, locationWarning },
      );

    this.logger.log(`Calculating new Impact for Intervention...`);
    await this.interventionBuilder.calculateNewImpactForNewLocations(
      newLocations,
      dto.newIndicatorCoefficients,
      newIntervention,
    );

    /**
     * After both sets of new Sourcing Locations with Sourcing Record (and Impact Records in the future) for the start year has been created
     * and added as relations to the new Scenario Intervention, saving the new Scenario intervention in database
     */
    this.logger.log(`Saving intervention...`);

    const savedIntervention: InsertResult =
      await this.scenarioInterventionRepository.saveNewIntervention(
        newIntervention,
      );

    this.logger.log(
      `New Intervention with Id: ${savedIntervention.identifiers[0].id} saved.`,
    );

    return {
      id: savedIntervention.identifiers[0].id,
      title: newIntervention.title,
      updatedById: newIntervention.updatedById,
    };
  }

  /**
   * Following 3 methods are used to create an array of objects with properties of Sourcing locations, that later will be saved
   * in sourcing_locations table as the ones belonging to the intervention, representing:
   * - Sourcing Locations canceled by the Intervention (basically copies of the existing ones, requested by Intervention, but with reference to Intervention Id and type 'Cancelling..')
   * - Sourcing Location created by the Intervention, with alternative material / suppliers
   */

  /**
   * In case of New Supplier Intervention , new 'replacing' Sourcing Location will be created for each of the canceled Sourcing Locations.
   * Each of the new Intervention's Sourcing Locations will have the same materialId as the relative canceled one, but all supplier location data will be new
   * (received from dto and geocoded to add new AdminRegion and GeoRegion)
   */

  /**
   * This method is used when we need to generate the Sourcing Locations Data of type canceled or for Intervention type "Change production efficiency".
   * Canceled Sourcing Locations of the Intervention are 'copies' of the existing Sourcing Locations, found through dto filters received from user, but with reference to InterventionId
   * and intervention sourcing location type CANCELED
   * New Sourcing Locations of Intervention of type "Change production efficiency" have the same format (copies with references to intervention and type), since changes of the intervention
   * do not affect material, neither supplier location - changes of coefficients will be applied in the moment of calculating new impact of the Intervention
   */

  async createNewSourcingLocationsForIntervention(
    sourcingLocations: SourcingLocation[],
    canceledOrReplacing: SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  ): Promise<SourcingLocation[]> {
    const cancelledSourcingLocations: SourcingLocation[] = [];
    for (const location of sourcingLocations) {
      const newCancelledInterventionLocation: SourcingLocation =
        new SourcingLocation();
      newCancelledInterventionLocation.materialId = location.materialId;
      newCancelledInterventionLocation.locationType = location.locationType;
      newCancelledInterventionLocation.locationCountryInput =
        location.locationCountryInput;
      newCancelledInterventionLocation.locationAddressInput =
        location.locationAddressInput;
      newCancelledInterventionLocation.locationLatitude =
        location.locationLatitude;
      newCancelledInterventionLocation.locationLongitude =
        location.locationLongitude;
      newCancelledInterventionLocation.t1SupplierId = location.t1SupplierId;
      newCancelledInterventionLocation.producerId = location.producerId;
      newCancelledInterventionLocation.businessUnitId = location.businessUnitId;
      newCancelledInterventionLocation.geoRegionId = location.geoRegionId;
      newCancelledInterventionLocation.adminRegionId = location.adminRegionId;
      newCancelledInterventionLocation.sourcingRecords =
        location.sourcingRecords.map((elem: any) => {
          return {
            year: elem.year,
            tonnage: elem.tonnage,
            indicatorRecords: elem.indicatorRecords.map(
              (impact: IndicatorRecord) => ({
                value: impact.value,
                scaler: impact.scaler,
                indicatorId: impact.indicatorId,
                materialH3DataId: impact.materialH3DataId,
              }),
            ),
          } as SourcingRecord;
        });
      newCancelledInterventionLocation.interventionType = canceledOrReplacing;
      cancelledSourcingLocations.push(newCancelledInterventionLocation);
    }

    return cancelledSourcingLocations;
  }

  static createInterventionInstance(
    dto: CreateScenarioInterventionDto,
  ): ScenarioIntervention {
    const scenarioIntervention: ScenarioIntervention =
      new ScenarioIntervention();
    scenarioIntervention.title = dto.title || 'Untitled';
    scenarioIntervention.description = dto.description;
    scenarioIntervention.scenarioId = dto.scenarioId;
    scenarioIntervention.startYear = dto.startYear;
    scenarioIntervention.percentage = dto.percentage;
    scenarioIntervention.endYear = dto.endYear;
    scenarioIntervention.type = dto.type;
    scenarioIntervention.newIndicatorCoefficients =
      dto.newIndicatorCoefficients as unknown as JSON;
    scenarioIntervention.newLocationType = dto.newLocationType;
    scenarioIntervention.newLocationCountryInput = dto.newLocationCountryInput;
    scenarioIntervention.newLocationAddressInput = dto.newLocationAddressInput;
    scenarioIntervention.newLocationLatitudeInput = dto.newLocationLatitude;
    scenarioIntervention.newLocationLongitudeInput = dto.newLocationLongitude;
    scenarioIntervention.createDto = dto as unknown as JSON;

    return scenarioIntervention;
  }

  async updateIntervention(
    id: string,
    dto: UpdateScenarioInterventionDto,
  ): Promise<Partial<ScenarioIntervention>> {
    for (const k of Object.keys(dto)) {
      if (!this.basicUpdateColumns.includes(k)) {
        return await this.replaceScenarioIntervention(id, dto);
      }
    }
    return await this.update(id, dto);
  }

  /**
   * This method is used when we need to update intervention in a way that will cause recalculation.
   * New Scenario intervention is created and old one with all related data is deleted
   */
  async replaceScenarioIntervention(
    id: string,
    dto: UpdateScenarioInterventionDto,
  ): Promise<Partial<ScenarioIntervention>> {
    const currentScenarioIntervention: ScenarioIntervention =
      await this.repository.findOneOrFail({ where: { id } });
    // TODO: Add proper typing once old methodology related deleted
    const newScenarioIntervention: Partial<ScenarioIntervention> =
      await this.createScenarioIntervention(
        dto as CreateScenarioInterventionDto,
      );

    await this.repository.remove(currentScenarioIntervention);
    // since we create new intervention, updatedBy must be set manually
    newScenarioIntervention.updatedById = dto.updatedById;
    await this.repository.save(newScenarioIntervention);

    return {
      id: newScenarioIntervention.id,
      updatedById: newScenarioIntervention.updatedById,
    };
  }

  /**
   * @description: Validate new the location
   *               Uses GeocodingService to obtain the required location info for the new Sourcing Location/s
   *               Ids of AdminRegion and GeoRegion, and a location warning (if applies)
   *               Will throw and exception if any error happens during the GeoCoding
   * @private
   */

  private async validateNewLocation(
    dto: CreateScenarioInterventionDto,
  ): Promise<
    | SourcingLocation
    | {
        adminRegionId: string;
        geoRegionId: string;
        locationWarning: string;
      }
  > {
    if (dto.type !== SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY) {
      return this.geoCodingService.geoCodeSourcingLocation({
        locationAdminRegionInput: dto.newLocationAdminRegionInput,
        locationLongitude: dto.newLocationLongitude,
        locationLatitude: dto.newLocationLatitude,
        locationAddressInput: dto.newLocationAddressInput,
        locationCountryInput: dto.newLocationCountryInput,
        locationType: dto.newLocationType,
      });
    }
    return {} as {
      adminRegionId: string;
      geoRegionId: string;
      locationWarning: string;
    };
  }
}
