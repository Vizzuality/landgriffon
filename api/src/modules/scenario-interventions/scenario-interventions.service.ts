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
import { SourcingData } from 'modules/import-data/sourcing-data/dto-processor.service';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { GeoCodingAbstractClass } from 'modules/geo-coding/geo-coding-abstract-class';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import { InterventionGeneratorService } from 'modules/scenario-interventions/services/intervention-generator.service';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IndicatorCoefficientsDto } from 'modules/indicator-coefficients/dto/indicator-coefficients.dto';

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
    @InjectRepository(ScenarioInterventionRepository)
    protected readonly scenarioInterventionRepository: ScenarioInterventionRepository,
    protected readonly interventionGenerator: InterventionGeneratorService,
    protected readonly geoCodingService: GeoCodingAbstractClass,
    protected readonly sourcingLocationsService: SourcingLocationsService,
    protected readonly indicatorRecordsService: IndicatorRecordsService,
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
        'replacedMaterials',
        'replacedBusinessUnits',
        'replacedAdminRegions',
        'replacedSuppliers',
        'newMaterial',
        'newBusinessUnit',
        'newAdminRegion',
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

  async getScenarioInterventionsByScenarioId(
    scenarioId: string,
  ): Promise<ScenarioIntervention[]> {
    return this.scenarioInterventionRepository.find({ scenarioId });
  }

  async createScenarioIntervention(
    dto: CreateScenarioInterventionDto,
  ): Promise<ScenarioIntervention> {
    /**
     *  Getting descendants of adminRegions, materials, suppliers adn businessUnits received as filters, if exists
     */
    const dtoWithDescendants: CreateScenarioInterventionDto =
      await this.interventionGenerator.addDescendantsEntitiesForFiltering(dto);

    /**
     * Getting Sourcing Locations and Sourcing Records for start year of all Materials of the intervention with applied filters
     */

    const actualSourcingDataWithTonnage: SourcingLocation[] =
      await this.sourcingLocationsService.findFilteredSourcingLocationsForIntervention(
        dtoWithDescendants,
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
      await this.createNewSourcingLocationsForIntervention(
        actualSourcingDataWithTonnage,
        SOURCING_LOCATION_TYPE_BY_INTERVENTION.CANCELED,
      );

    // Saving new Sourcing Locations with intervention type canceled and reference to the new Intervention Id with start year record

    const cancelledInterventionSourcingLocations: SourcingLocation[] =
      await this.sourcingLocationsService.save(
        newCancelledByInterventionLocationsData,
      );

    // Saving Indicator records for newly created Sourcing Locations of type canceled:

    for (const sourcingLocation of cancelledInterventionSourcingLocations) {
      for await (const sourcingRecord of sourcingLocation.sourcingRecords) {
        await this.indicatorRecordsService.createIndicatorRecordsBySourcingRecords(
          {
            sourcingRecordId: sourcingRecord.id,
            tonnage: sourcingRecord.tonnage,
            geoRegionId: sourcingLocation.geoRegionId,
            materialId: sourcingLocation.materialId,
            year: sourcingRecord.year,
          },
          dto.newIndicatorCoefficients,
        );
      }
    }

    /**
     *  Creating New Intervention to be saved in scenario_interventions table
     */

    const newScenarioIntervention: ScenarioIntervention =
      ScenarioInterventionsService.createInterventionInstance(
        dtoWithDescendants,
        dto,
      );

    // Add replaced Entities to new Scenario Intervention

    const newInterventionWithReplacedElements: ScenarioIntervention =
      await this.interventionGenerator.addReplacedElementsToIntervention(
        newScenarioIntervention,
        cancelledInterventionSourcingLocations,
      );

    /**
     * NEW SOURCING LOCATIONS #2 - The ones of the Intervention, will replace the CANCELED ones
     * Depending on the intervention type
     */

    let newInterventionSourcingLocations: SourcingLocation[];
    let newInterventionWithReplacingElements: ScenarioIntervention;

    switch (dto.type) {
      case SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL:
        const newMaterialInterventionLocation: SourcingData[] =
          await this.createNewReplacingSourcingLocationsForNewMaterialIntervention(
            dto,
            actualSourcingDataWithTonnage,
          );

        newInterventionWithReplacingElements =
          await this.interventionGenerator.addReplacingElementsToIntervention(
            newInterventionWithReplacedElements,
            newMaterialInterventionLocation,
            SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL,
          );

        await this.createReplacingSourcingLocationsForIntervention(
          newMaterialInterventionLocation,
          dto.newIndicatorCoefficients,
          newInterventionWithReplacedElements,
        );

        break;

      case SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER:
        const newSupplerInterventionLocations: SourcingData[] =
          await this.createNewReplacingSourcingLocationsForNewSupplierIntervention(
            dto,
            actualSourcingDataWithTonnage,
          );

        newInterventionWithReplacingElements =
          await this.interventionGenerator.addReplacingElementsToIntervention(
            newInterventionWithReplacedElements,
            newSupplerInterventionLocations,
            SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER,
          );

        await this.createReplacingSourcingLocationsForIntervention(
          newSupplerInterventionLocations,
          dto.newIndicatorCoefficients,
          newInterventionWithReplacedElements,
        );
        break;

      case SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY:
        const newEfficiencyChangeInterventionLocations: CreateSourcingLocationDto[] =
          await this.createNewSourcingLocationsForIntervention(
            actualSourcingDataWithTonnage,
            SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
          );

        await this.createReplacingSourcingLocationsForIntervention(
          newEfficiencyChangeInterventionLocations,
          dto.newIndicatorCoefficients,
          newInterventionWithReplacedElements,
        );

        break;
    }

    /**
     * After both sets of new Sourcing Locations with Sourcing Record (and Impact Records in the future) for the start year has been created
     * and added as relations to the new Scenario Intervention, saving the new Scenario intervention in database
     */
    return this.scenarioInterventionRepository.save(newScenarioIntervention);

    //return this.scenarioInterventionRepository.save(newScenarioIntervention);
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
   * that are being canceled by the Intervention, and multiplied by the percentage selected by the user
   */
  async createNewReplacingSourcingLocationsForNewMaterialIntervention(
    dto: CreateScenarioInterventionDto,
    sourcingData: SourcingLocation[],
  ): Promise<SourcingData[]> {
    const sourcingRecords: { year: number; tonnage: number }[] = [];
    /**
     * For each year in SourcingRecords, sum up all tonnages for that year
     */
    sourcingData.forEach((sourcingLocation: SourcingLocation) => {
      sourcingLocation.sourcingRecords.forEach(
        (sourcingRecord: SourcingRecord) => {
          const sr: { year: number; tonnage: number } | undefined =
            sourcingRecords.find(
              (elem: { year: number; tonnage: number }) =>
                elem.year === sourcingRecord.year,
            );
          if (sr) sr.tonnage += Number(sourcingRecord.tonnage);
          else
            sourcingRecords.push({
              year: sourcingRecord.year,
              tonnage: Number(sourcingRecord.tonnage),
            });
        },
      );
    });

    const intervenedSourcingRecords: { year: number; tonnage: number }[] =
      sourcingRecords.map(
        (sourcingRecord: { year: number; tonnage: number }) => {
          return {
            year: sourcingRecord.year,
            tonnage: sourcingRecord.tonnage * (dto.percentage / 100),
          };
        },
      );

    const newInterventionLocationDataForGeoCoding: SourcingData[] = [
      {
        materialId: dto.newMaterialId as string,
        locationType: dto.newLocationType,
        locationAddressInput: dto.newLocationAddressInput,
        locationCountryInput: dto.newLocationCountryInput,
        locationLongitude: dto.newLocationLongitude,
        locationLatitude: dto.newLocationLatitude,
        t1SupplierId: dto.newT1SupplierId,
        producerId: dto.newProducerId,
        businessUnitId: sourcingData[0].businessUnitId,
        sourcingRecords: intervenedSourcingRecords,
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
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
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

  async createNewReplacingSourcingLocationsForNewSupplierIntervention(
    dto: CreateScenarioInterventionDto,
    sourcingData: SourcingLocation[],
  ): Promise<SourcingData[]> {
    const locationSampleForGeoCoding: SourcingData[] = [
      {
        materialId: sourcingData[0].materialId,
        locationType: dto.newLocationType,
        locationAddressInput: dto.newLocationAddressInput,
        locationCountryInput: dto.newLocationCountryInput,
        locationLatitude: dto.newLocationLatitude,
        locationLongitude: dto.newLocationLongitude,
        t1SupplierId: dto.newT1SupplierId,
        producerId: dto.newProducerId,
        businessUnitId: sourcingData[0].businessUnitId,
        sourcingRecords: sourcingData[0].sourcingRecords,
      },
    ];

    const geoCodedLocationSample: SourcingData[] =
      await this.geoCodingService.geoCodeLocations(locationSampleForGeoCoding);

    const newSourcingLocationData: SourcingData[] = [];
    for (const location of sourcingData) {
      const identicalSourcingLocationDataIndex: number | undefined =
        newSourcingLocationData.findIndex(
          (el: SourcingData) =>
            location.materialId === el.materialId &&
            location.businessUnitId === el.businessUnitId,
        );

      if (identicalSourcingLocationDataIndex >= 0) {
        const updatedSourcingRecords: SourcingRecord[] =
          this.updateNewSupplierLocationTonnage(
            newSourcingLocationData,
            identicalSourcingLocationDataIndex,
            location.sourcingRecords,
          );
        newSourcingLocationData[
          identicalSourcingLocationDataIndex
        ].sourcingRecords = updatedSourcingRecords;
      } else {
        const newInterventionLocation: SourcingData = {
          materialId: location.materialId,
          locationType: dto.newLocationType,
          locationAddressInput: dto.newLocationAddressInput,
          locationCountryInput: dto.newLocationCountryInput,
          locationLatitude: dto.newLocationLatitude,
          locationLongitude: dto.newLocationLongitude,
          t1SupplierId: dto.newT1SupplierId,
          producerId: dto.newProducerId,
          businessUnitId: location.businessUnitId,
          geoRegionId: geoCodedLocationSample[0].geoRegionId,
          adminRegionId: geoCodedLocationSample[0].adminRegionId,
          locationWarning: geoCodedLocationSample[0].locationWarning,
          sourcingRecords: location.sourcingRecords.map((elem: any) => {
            return { year: elem.year, tonnage: elem.tonnage };
          }),
          interventionType: SOURCING_LOCATION_TYPE_BY_INTERVENTION.REPLACING,
        };

        newSourcingLocationData.push(newInterventionLocation);
      }
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

  async createNewSourcingLocationsForIntervention(
    sourcingData: SourcingLocation[],
    canceledOrReplacing: SOURCING_LOCATION_TYPE_BY_INTERVENTION,
  ): Promise<SourcingData[]> {
    const newSourcingLocationData: SourcingData[] = [];

    for (const location of sourcingData) {
      const newCancelledInterventionLocation: SourcingData = {
        materialId: location.materialId,
        locationType: location.locationType,
        locationCountryInput: location.locationCountryInput,
        locationAddressInput: location.locationAddressInput,
        locationLatitude: location.locationLatitude,
        locationLongitude: location.locationLongitude,
        t1SupplierId: location.t1SupplierId,
        producerId: location.producerId,
        businessUnitId: location.businessUnitId,
        geoRegionId: location.geoRegionId,
        adminRegionId: location.adminRegionId,
        sourcingRecords: location.sourcingRecords.map((elem: any) => {
          return { year: elem.year, tonnage: elem.tonnage };
        }),
        interventionType: canceledOrReplacing,
      };

      newSourcingLocationData.push(newCancelledInterventionLocation);
    }

    return newSourcingLocationData;
  }

  private async createReplacingSourcingLocationsForIntervention(
    newInterventionLocation: CreateSourcingLocationDto[],
    newIndicatorCoefficients: IndicatorCoefficientsDto | undefined,
    newScenarioIntervention: ScenarioIntervention,
  ): Promise<void> {
    const newInterventionSourcingLocations: SourcingLocation[] =
      await this.sourcingLocationsService.save(newInterventionLocation);

    for (const sourcingLocation of newInterventionSourcingLocations) {
      for await (const sourcingRecord of sourcingLocation.sourcingRecords) {
        await this.indicatorRecordsService.createIndicatorRecordsBySourcingRecords(
          {
            sourcingRecordId: sourcingRecord.id,
            tonnage: sourcingRecord.tonnage,
            geoRegionId: sourcingLocation.geoRegionId,
            materialId: sourcingLocation.materialId,
            year: sourcingRecord.year,
          },
          newIndicatorCoefficients,
        );
      }
    }

    newScenarioIntervention.newSourcingLocations =
      newInterventionSourcingLocations;
  }

  static createInterventionInstance(
    dto: CreateScenarioInterventionDto,
    initialDto: CreateScenarioInterventionDto,
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
    scenarioIntervention.createDto = initialDto as unknown as JSON;

    return scenarioIntervention;
  }

  async updateIntervention(
    id: string,
    dto: UpdateScenarioInterventionDto,
  ): Promise<ScenarioIntervention> {
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
  ): Promise<ScenarioIntervention> {
    const currentScenarioIntervention: ScenarioIntervention =
      await this.repository.findOneOrFail({ id });
    const createScenarioDto: CreateScenarioInterventionDto = {
      ...(currentScenarioIntervention.createDto as unknown as CreateScenarioInterventionDto),
      ...dto,
    };
    const newScenarioIntervention: ScenarioIntervention =
      await this.createScenarioIntervention(createScenarioDto);

    await this.repository.remove(currentScenarioIntervention);
    // since we create new intervention, updatedBy must be set manually
    newScenarioIntervention.updatedById = dto.updatedById;
    await this.repository.save(newScenarioIntervention);
    return newScenarioIntervention;
  }

  updateNewSupplierLocationTonnage(
    existingSourcingLocations: SourcingData[],
    index: number,
    newSourcingRecords: SourcingRecord[],
  ): SourcingRecord[] {
    const joinedRecords: { year: number; tonnage: number }[] =
      existingSourcingLocations[index].sourcingRecords.concat(
        newSourcingRecords,
      );

    const mergedRecords: { year: SourcingRecord } = joinedRecords.reduce(
      (acc: any, sourcingRecords: { year: number; tonnage: number }) => {
        acc[sourcingRecords.year] = {
          year: sourcingRecords.year,
          tonnage:
            (acc[sourcingRecords.year]
              ? Number(acc[sourcingRecords.year].tonnage)
              : 0) + Number(sourcingRecords.tonnage),
        };
        return acc;
      },
      {},
    );

    return Object.values(mergedRecords);
  }
}
