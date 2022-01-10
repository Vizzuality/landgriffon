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
import { H3MapResponse } from 'modules/h3-data/dto/h3-map-response.dto';
import {
  Indicator,
  INDICATOR_TYPES,
} from 'modules/indicators/indicator.entity';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { H3FilterYearsByLayerService } from 'modules/h3-data/services/h3-filter-years-by-layer.service';
import { GetImpactMapDto } from 'modules/h3-data/dto/get-impact-map.dto';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';

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
    private readonly indicatorService: IndicatorsService,
    private readonly unitConversionsService: UnitConversionsService,
    private readonly sourcingRecordService: SourcingRecordsService,
    private readonly filterYearsByLayerService: H3FilterYearsByLayerService,
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

  async getWaterRiskIndicatorRecordValue(
    producerH3Table: H3Data,
    harvestH3Table: H3Data,
    indicatorH3Table: H3Data,
    sourcingRecordId: string,
  ): Promise<number | null> {
    return this.h3DataRepository.getWaterRiskIndicatorRecordValue(
      producerH3Table,
      harvestH3Table,
      indicatorH3Table,
      sourcingRecordId,
    );
  }

  async getDeforestationLossIndicatorRecordValue(
    producerH3Table: H3Data,
    harvestH3Table: H3Data,
    indicatorH3Table: H3Data,
    sourcingRecordId: string,
  ): Promise<number | null> {
    return this.h3DataRepository.getDeforestationLossIndicatorRecordValue(
      producerH3Table,
      harvestH3Table,
      indicatorH3Table,
      sourcingRecordId,
    );
  }

  async getBiodiversityLossIndicatorRecordValue(
    producerH3Table: H3Data,
    harvestH3Table: H3Data,
    indicatorH3Table: H3Data,
    sourcingRecordId: string,
  ): Promise<number | null> {
    return this.h3DataRepository.getBiodiversityLossIndicatorRecordValue(
      producerH3Table,
      harvestH3Table,
      indicatorH3Table,
      sourcingRecordId,
    );
  }

  async getCarbonIndicatorRecordValue(
    producerH3Table: H3Data,
    harvestH3Table: H3Data,
    indicatorH3Table: H3Data,
    sourcingRecordId: string,
  ): Promise<number | null> {
    return this.h3DataRepository.getCarbonIndicatorRecordValue(
      producerH3Table,
      harvestH3Table,
      indicatorH3Table,
      sourcingRecordId,
    );
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

    const availableIndicatorYears: number[] =
      await this.getAvailableYearsForH3IndicatorData(indicatorId);

    let indicatorDataYear: number | undefined =
      availableIndicatorYears.includes(year)
        ? year
        : availableIndicatorYears.find((el: number) => el < year);

    if (!indicatorDataYear)
      indicatorDataYear = availableIndicatorYears
        .reverse()
        .find((el: number) => el > year);

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

    const availableHarvestDataYears: number[] =
      await this.getAvailableYearsForH3MaterialData(
        materialId,
        MATERIAL_TO_H3_TYPE.HARVEST,
      );

    let harvestDataYear: number | undefined =
      availableHarvestDataYears.includes(year)
        ? year
        : availableHarvestDataYears.find((el: number) => el < year);

    if (!harvestDataYear)
      harvestDataYear = availableHarvestDataYears
        .reverse()
        .find((el: number) => el > year);

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

    const availableProducerDataYears: number[] =
      await this.getAvailableYearsForH3MaterialData(
        materialId,
        MATERIAL_TO_H3_TYPE.PRODUCER,
      );

    let producerDataYear: number | undefined =
      availableProducerDataYears.includes(year)
        ? year
        : availableProducerDataYears.find((el: number) => el < year);

    if (!producerDataYear)
      producerDataYear = availableProducerDataYears
        .reverse()
        .find((el: number) => el > year);

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

    return {
      data: riskMap,
      metadata: {
        quantiles: quantiles,
        unit: indicator.unit.symbol,
        indicatorDataYear,
        harvestDataYear,
        producerDataYear,
      },
    };
  }

  async getYearsByLayerType(
    layerType: string,
    materialIds?: string[],
    indicatorId?: string,
  ): Promise<number[]> {
    return this.filterYearsByLayerService.getYearsByLayerType(
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

    this.logger.log(`Generating impact map for indicator ${indicator.name}...`);

    const impactMap: {
      riskMap: H3IndexValueData[];
      quantiles: number[];
    } = await this.h3DataRepository.getImpactMap(
      indicator,
      getImpactMapDto.resolution,
      getImpactMapDto.year,
      getImpactMapDto.materialIds,
      getImpactMapDto.originIds,
      getImpactMapDto.supplierIds,
    );

    return {
      data: impactMap.riskMap,
      metadata: {
        quantiles: impactMap.quantiles,
        unit: indicator.unit.symbol,
      },
    };
  }

  async getAvailableYearsForH3MaterialData(
    materialId: string,
    materialType: MATERIAL_TO_H3_TYPE,
  ): Promise<number[]> {
    return await this.h3DataRepository.getAvailableYearsForH3MaterialData(
      materialId,
      materialType,
    );
  }

  async getAvailableYearsForH3IndicatorData(
    indicatorId: string,
  ): Promise<number[]> {
    return await this.h3DataRepository.getAvailableYearsForH3IndicatorData(
      indicatorId,
    );
  }
}
