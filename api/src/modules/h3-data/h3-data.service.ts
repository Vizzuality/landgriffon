import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { MaterialsService } from 'modules/materials/materials.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { UnitConversionsService } from 'modules/unit-conversions/unit-conversions.service';
import {
  H3MapResponse,
  MaterialsH3DataYears,
} from 'modules/h3-data/dto/h3-map-response.dto';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { H3DataYearsService } from 'modules/h3-data/services/h3-data-years.service';
import { GetImpactMapDto } from 'modules/h3-data/dto/get-impact-map.dto';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SuppliersService } from 'modules/suppliers/suppliers.service';

/**
 * @debt: Check if we actually need extending nestjs-base-service over this module.
 * We should not need performing CRUD operations. Even if we want filtering capabilities
 * by abstraction (via nestjs-base-service), check if we can apply to the actual target tables since are not related to this entity

 */
@Injectable()
export class H3DataService {
  logger: Logger = new Logger(H3DataService.name);

  constructor(
    @InjectRepository(H3DataRepository)
    protected readonly h3DataRepository: H3DataRepository,
    protected readonly materialService: MaterialsService,
    protected readonly materialToH3Service: MaterialsToH3sService,
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly supplierService: SuppliersService,
    private readonly indicatorService: IndicatorsService,
    private readonly unitConversionsService: UnitConversionsService,
    private readonly sourcingRecordService: SourcingRecordsService,
    private readonly h3DataYearsService: H3DataYearsService,
  ) {}

  /**
   * Find one H3 full data by its name
   */
  async findH3ByName(
    h3TableName: string,
    h3ColumnName: string,
  ): Promise<H3IndexValueData[]> {
    return await this.h3DataRepository.findH3ByName(h3TableName, h3ColumnName);
  }

  async getById(id: string): Promise<H3Data | undefined> {
    return await this.h3DataRepository.findOne({ id });
  }

  async findH3ByIndicatorId(indicatorId: string): Promise<H3Data | undefined> {
    return await this.h3DataRepository.findOne({ indicatorId });
  }

  async getMaterialMapByResolution(
    materialId: string,
    resolution: number,
    year: number,
  ): Promise<H3MapResponse> {
    /**
     * @note Currently we need to retrieve a unit to be shown on client, for a material
     * As all material-maps share the same unit, and we have no way no retrieve this unit from DB
     * as it does not exist, we hardcode it here and send it back as response
     */
    const MATERIAL_UNIT: string = 'tonnes';
    /**
     * @note To generate a Material Map, a producerId is required
     */
    const materialH3Data: H3Data | undefined =
      await this.materialToH3Service.findH3DataForMaterial({
        materialId,
        year,
        type: MATERIAL_TO_H3_TYPE.PRODUCER,
      });

    if (!materialH3Data)
      throw new NotFoundException(
        `There is no H3 Data for Material with ID: ${materialId}`,
      );

    const { materialMap, quantiles } =
      await this.h3DataRepository.getMaterialMapByResolution(
        materialH3Data,
        resolution,
      );

    return {
      data: materialMap,
      metadata: { quantiles: quantiles, unit: MATERIAL_UNIT },
    };
  }

  async getRiskMapByResolution(
    materialId: string,
    indicatorId: string,
    resolution: number,
    year: number,
  ): Promise<H3MapResponse> {
    /**
     * @note To generate a Risk Map, harvest data and h3Data by indicatorId are required
     */

    const indicatorDataYear: number | undefined =
      await this.h3DataYearsService.getClosestAvailableYearForIndicatorH3(
        indicatorId,
        year,
      );

    if (!indicatorDataYear)
      throw new NotFoundException(
        `There is no H3 Data registered for Indicator with ID ${indicatorId} for year ${year} or any other year`,
      );
    const indicatorH3Data: H3Data | undefined =
      await this.h3DataRepository.findOne({
        where: { indicatorId, year: indicatorDataYear },
      });

    if (!indicatorH3Data)
      throw new NotFoundException(
        `There is no H3 Data for Indicator with ID ${indicatorId} and year ${year}`,
      );

    const material: Material = await this.materialService.getMaterialById(
      materialId,
    );

    const materialsH3DataYears: MaterialsH3DataYears[] = [];

    const harvestDataYear: number | undefined =
      await this.h3DataYearsService.getClosestAvailableYearForMaterialH3(
        materialId,
        MATERIAL_TO_H3_TYPE.HARVEST,
        year,
      );

    if (!harvestDataYear)
      throw new NotFoundException(
        `There is no H3 Harvest data registered for Material with ID ${materialId} for year ${year} or any other year`,
      );

    const harvestMaterialH3Data: H3Data | undefined =
      await this.materialToH3Service.findH3DataForMaterial({
        materialId,
        year: harvestDataYear,
        type: MATERIAL_TO_H3_TYPE.HARVEST,
      });
    if (!harvestMaterialH3Data) {
      throw new NotFoundException(
        `There is no H3 harvest data for Material with ID ${materialId} and year ${year}`,
      );
    }

    const producerDataYear: number | undefined =
      await this.h3DataYearsService.getClosestAvailableYearForMaterialH3(
        materialId,
        MATERIAL_TO_H3_TYPE.PRODUCER,
        year,
      );

    if (!producerDataYear)
      throw new NotFoundException(
        `There is no H3 Producer data registered for Material with ID ${materialId} for year ${year} or any other year`,
      );

    const producerMaterialH3Data: H3Data | undefined =
      await this.materialToH3Service.findH3DataForMaterial({
        materialId,
        year: producerDataYear,
        type: MATERIAL_TO_H3_TYPE.PRODUCER,
      });
    if (!producerMaterialH3Data) {
      throw new NotFoundException(
        `There is no H3 producer data for Material with ID ${materialId} and year ${year}`,
      );
    }

    const indicator: Indicator = await this.indicatorService.getIndicatorById(
      indicatorId,
    );

    if (!indicator.unit) {
      throw new NotFoundException(
        `Indicator with ID ${indicatorId} has no unit`,
      );
    }

    const { factor } =
      await this.unitConversionsService.getUnitConversionByUnitId(
        indicator.unit.id,
      );

    if (!factor) {
      throw new NotFoundException(
        `Conversion Unit with ID ${indicator.unit.id} has no 'factor' value`,
      );
    }

    let riskMap: H3IndexValueData[];
    let quantiles: number[] = [];
    switch (indicator.nameCode) {
      case INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE:
        const waterRiskmapResponse: {
          riskMap: H3IndexValueData[];
          quantiles: number[];
        } = await this.h3DataRepository.getWaterRiskMapByResolution(
          indicatorH3Data,
          producerMaterialH3Data as H3Data,
          factor as number,
          resolution,
        );
        riskMap = waterRiskmapResponse.riskMap;
        quantiles = waterRiskmapResponse.quantiles;
        break;
      case INDICATOR_TYPES.DEFORESTATION:
        const deforestationRiskmapResponse: {
          riskMap: H3IndexValueData[];
          quantiles: number[];
        } = await this.h3DataRepository.getDeforestationLossRiskMapByResolution(
          indicatorH3Data,
          producerMaterialH3Data as H3Data,
          harvestMaterialH3Data as H3Data,
          resolution,
        );
        riskMap = deforestationRiskmapResponse.riskMap;
        quantiles = deforestationRiskmapResponse.quantiles;
        break;
      case INDICATOR_TYPES.CARBON_EMISSIONS:
        const deforestationH3DataForCarbonEmissions: H3Data =
          await this.indicatorService.getDeforestationH3Data();
        const carbonEmissionRiskmapResponse: {
          riskMap: H3IndexValueData[];
          quantiles: number[];
        } = await this.h3DataRepository.getCarbonEmissionsRiskMapByResolution(
          indicatorH3Data,
          producerMaterialH3Data as H3Data,
          harvestMaterialH3Data as H3Data,
          deforestationH3DataForCarbonEmissions,
          factor as number,
          resolution,
        );
        riskMap = carbonEmissionRiskmapResponse.riskMap;
        quantiles = carbonEmissionRiskmapResponse.quantiles;

        break;
      case INDICATOR_TYPES.BIODIVERSITY_LOSS:
        const deforestationH3DataForBiodiversityLoss: H3Data =
          await this.indicatorService.getDeforestationH3Data();
        const biodiversityRiskmapResponse: {
          riskMap: H3IndexValueData[];
          quantiles: number[];
        } = await this.h3DataRepository.getBiodiversityLossRiskMapByResolution(
          indicatorH3Data,
          producerMaterialH3Data as H3Data,
          harvestMaterialH3Data as H3Data,
          deforestationH3DataForBiodiversityLoss,
          factor as number,
          resolution,
        );
        riskMap = biodiversityRiskmapResponse.riskMap;
        quantiles = biodiversityRiskmapResponse.quantiles;

        break;
      default:
        throw new ServiceUnavailableException(
          `Risk map for indicator ${indicator.name} (indicator nameCode ${indicator.nameCode}) not currently supported`,
        );
    }

    materialsH3DataYears.push(
      {
        materialName: material.name,
        materialDataYear: harvestDataYear,
        materialDataType: MATERIAL_TO_H3_TYPE.HARVEST,
      },
      {
        materialName: material.name,
        materialDataYear: producerDataYear,
        materialDataType: MATERIAL_TO_H3_TYPE.PRODUCER,
      },
    );

    return {
      data: riskMap,
      metadata: {
        quantiles: quantiles,
        unit: indicator.unit.symbol,
        indicatorDataYear,
        materialsH3DataYears,
      },
    };
  }

  async getYearsByLayerType(
    layerType: string,
    materialIds?: string[],
    indicatorId?: string,
  ): Promise<number[]> {
    if (materialIds) {
      materialIds = await this.materialService.getMaterialsDescendants(
        materialIds,
      );
    }
    return this.h3DataYearsService.getYearsByLayerType(
      layerType,
      materialIds,
      indicatorId,
    );
  }

  async getImpactMapByResolution(
    getImpactMapDto: GetImpactMapDto,
  ): Promise<H3MapResponse> {
    const indicatorH3Data: H3Data | undefined =
      await this.h3DataRepository.findOne({
        where: { indicatorId: getImpactMapDto.indicatorId },
      });

    if (!indicatorH3Data)
      throw new NotFoundException(
        `There is no H3 Data for Indicator with ID: ${getImpactMapDto.indicatorId}`,
      );

    const indicator: Indicator = await this.indicatorService.getIndicatorById(
      getImpactMapDto.indicatorId,
    );

    if (!indicator.unit) {
      throw new NotFoundException(
        `Indicator with ID ${getImpactMapDto.indicatorId} has no unit`,
      );
    }

    if (getImpactMapDto.originIds) {
      getImpactMapDto.originIds =
        await this.adminRegionService.getAdminRegionDescendants(
          getImpactMapDto.originIds,
        );
    }

    if (getImpactMapDto.supplierIds) {
      getImpactMapDto.supplierIds =
        await this.supplierService.getSuppliersDescendants(
          getImpactMapDto.supplierIds,
        );
    }

    if (getImpactMapDto.materialIds) {
      getImpactMapDto.materialIds =
        await this.materialService.getMaterialsDescendants(
          getImpactMapDto.materialIds,
        );
    }

    this.logger.log(`Generating impact map for indicator ${indicator.name}...`);

    const impactMap: {
      impactMap: H3IndexValueData[];
      quantiles: number[];
    } = await this.h3DataRepository.getImpactMap(
      indicator,
      getImpactMapDto.resolution,
      getImpactMapDto.year,
      getImpactMapDto.materialIds,
      getImpactMapDto.originIds,
      getImpactMapDto.supplierIds,
      getImpactMapDto.locationTypes,
    );

    const materialsH3DataYears: MaterialsH3DataYears[] = [];

    if (getImpactMapDto.materialIds?.length) {
      const requestedMaterials: Material[] =
        await this.materialService.getMaterialsById(
          getImpactMapDto.materialIds,
        );
      for (const material of requestedMaterials) {
        const materialHarvestH3DataYear: number | undefined =
          await this.h3DataYearsService.getClosestAvailableYearForMaterialH3(
            material.id,
            MATERIAL_TO_H3_TYPE.HARVEST,
            getImpactMapDto.year,
          );
        const materialProducerH3DataYear: number | undefined =
          await this.h3DataYearsService.getClosestAvailableYearForMaterialH3(
            material.id,
            MATERIAL_TO_H3_TYPE.PRODUCER,
            getImpactMapDto.year,
          );
        materialsH3DataYears.push(
          {
            materialName: material.name,
            materialDataYear: materialHarvestH3DataYear,
            materialDataType: MATERIAL_TO_H3_TYPE.HARVEST,
          },
          {
            materialName: material.name,
            materialDataYear: materialProducerH3DataYear,
            materialDataType: MATERIAL_TO_H3_TYPE.PRODUCER,
          },
        );
      }
    }
    return {
      data: impactMap.impactMap,
      metadata: {
        quantiles: impactMap.quantiles,
        unit: indicator.unit.symbol,
        indicatorDataYear: indicatorH3Data.year,
        ...(materialsH3DataYears.length ? { materialsH3DataYears } : {}),
      },
    };
  }
}
