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
  ScenarioIntervention,
  scenarioResource,
  SCENARIO_INTERVENTION_TYPE,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { ScenarioInterventionRepository } from 'modules/scenario-interventions/scenario-intervention.repository';
import { CreateScenarioInterventionDto } from 'modules/scenario-interventions/dto/create.scenario-intervention.dto';
import { UpdateScenarioInterventionDto } from 'modules/scenario-interventions/dto/update.scenario-intervention.dto';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { getManager } from 'typeorm';
//import { GeoCodingService } from 'modules/geo-coding/geo-coding.service';

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
  ) //protected readonly geoCodingService: GeoCodingService,
  {
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
    const growthRate: number = 1.5;
    const startYear: number = 2019;
    const scenarioIntervention: ScenarioIntervention =
      new ScenarioIntervention();

    // Depending on the type of scenario intervention - the dto should be processed by the relevant service.
    // For example in case of 'Change production efficiency scenario' the service will be the minimum - adding the initial intervention data + newIndicatorCoefficients
    // In case of 'New supplier intervention' depending on the received input, new Supplier and Sourcing location may be created and added to the new Scenario Intervention
    switch (dto.type) {
      case SCENARIO_INTERVENTION_TYPE.NEW_MATERIAL:
        //scenarioIntervention = await this.createNewMaterialScenarioIntervention(dto);
        break;
      case SCENARIO_INTERVENTION_TYPE.NEW_SUPPLIER:
        // Getting latest Sourcing Records of all Materials of the intervention
        const materialsAndTonnage: any[] =
          await this.findMaterialsStartYearTonnage(dto);

        //Starting to create data for Geo Coding
        const newSourcingData: any = [];
        for (const material of materialsAndTonnage) {
          //TODO businessUnit
          const newSourcingLocation: any = {};
          newSourcingLocation.materialId = material.materialId;
          newSourcingLocation.locationType =
            dto.newLocationType as LOCATION_TYPES;
          newSourcingLocation.locationAddressInput = dto.newAddressInput;
          newSourcingLocation.locationCountryInput = dto.newCountryInput;

          const newSourcingRecords: any = [];
          let tonnage: number = material.tonnage;
          for (let year: number = startYear + 1; year <= dto.endYear; ++year) {
            newSourcingRecords.push({ year, tonnage });
            tonnage *= growthRate;
          }
          newSourcingLocation.sourcingRecords = newSourcingRecords;
          newSourcingLocation.t1SupplierId = dto.newSupplierT1Id;
          newSourcingLocation.producerId = dto.newSupplierT1Id;

          newSourcingData.push(newSourcingLocation);
        }
        // // Geocoding newly created data:
        // const geoCodedSourcingData: any[] =
        //   await this.geoCodingService.geoCodeLocations(newSourcingData);

        // // Saving new locations
        // const newData: any = await this.sourcingLocationService.save(
        //   geoCodedSourcingData,
        // );

        // TODO - calculate impact with

        //return newData;

        break;
      case SCENARIO_INTERVENTION_TYPE.CHANGE_PRODUCTION_EFFICIENCY:
        // scenarioIntervention = await this.createNewProductionEfficiencyIntervention(dto)

        break;
    }

    return scenarioIntervention.save();
  }

  async findMaterialsStartYearTonnage(
    dto: CreateScenarioInterventionDto,
  ): Promise<SourcingLocation[]> {
    const sourcingLocations: SourcingLocation[] = await getManager()
      .createQueryBuilder()
      .select('sl.materialId')
      .addSelect('sr.year')
      .addSelect('SUM(sr.tonnage) as tonnage')
      .from(SourcingLocation, 'sl')
      .leftJoin('sourcing_records', 'sr', 'sr.sourcingLocationId = sl.id')
      .where('sl."materialId" IN (:...materialIds)', {
        materialIds: dto.materialsIds,
      })
      .andWhere('sl."t1SupplierId" IN (:...suppliers)', {
        suppliers: dto.suppliersIds,
      })
      .andWhere('sl."producerId" IN (:...suppliers)', {
        suppliers: dto.suppliersIds,
      })
      .orWhere('sl."producerId" IN (:...suppliers)', {
        suppliers: dto.suppliersIds,
      })
      .andWhere('sl."businessUnitId" IN (:...businessUnits)', {
        businessUnits: dto.businessUnitsIds,
      })
      .andWhere('sr.year = :startYear', { startYear: 2019 })
      // .andWhere('sl.adminRegionId IN (:...adminRegion)', {
      // adminRegion: dto.adminRegionsIds,
      // })
      .groupBy('sl.materialId')
      .addGroupBy('sr.year')
      .getRawMany();

    return sourcingLocations;
  }
}
