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

  async getMaterialMapByResolution(
    materialId: string,
    resolution: number,
  ): Promise<H3MapResponse> {
    /**
     * @note Currently we need to retrieve a unit to be shown on client, for a material
     * As all material-maps share the same unit, and we have no way no retrieve this unit from DB
     * as it does not exist, we hardcode it here and send it back as response
     */
    const MATERIAL_UNIT = 'tonnes';
    /**
     * @note To generate a Material Map, a producerId is required
     */
    const { producerId } = await this.materialService.getById(materialId);
    const materialH3Data = await this.h3DataRepository.findOne(producerId);

    if (!materialH3Data)
      throw new NotFoundException(
        `There is no H3 Data for Material with ID: ${materialId}`,
      );

    const materialMap = await this.h3DataRepository.getMaterialMapByResolution(
      materialH3Data,
      resolution,
    );

    const quantiles: number[] = await this.h3DataRepository.calculateQuantiles(
      materialH3Data,
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
  ): Promise<H3MapResponse> {
    /**
     * @note To generate a Risk Map, a harvestId and h3Data by indicatorId are required
     */
    const indicatorH3Data = await this.h3DataRepository.findOne({
      where: { indicatorId: indicatorId },
    });

    if (!indicatorH3Data)
      throw new NotFoundException(
        `There is no H3 Data for Indicator with ID: ${indicatorId}`,
      );
    const { harvestId } = await this.materialService.getById(materialId);

    if (!harvestId) {
      throw new NotFoundException(
        `There is no H3 Data for Material with ID: ${materialId}`,
      );
    }
    const materialH3Data = await this.h3DataRepository.findOne(harvestId);

    const indicator: Indicator = await this.indicatorService.getIndicatorById(
      indicatorId,
    );

    if (!indicator.unit) {
      throw new NotFoundException(
        `Indicator with ID ${indicatorId} has no unit`,
      );
    }

    const {
      factor,
    } = await this.unitConversionsService.getUnitConversionByUnitId(
      indicator.unit.id,
    );

    if (!factor) {
      throw new NotFoundException(
        `Conversion Unit with ID ${indicator.unit.id} has no 'factor' value`,
      );
    }

    let riskMap: H3IndexValueData[];
    switch (indicator.nameCode) {
      case INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE:
        riskMap = await this.h3DataRepository.getWaterRiskMapByResolution(
          indicatorH3Data,
          materialH3Data as H3Data,
          factor as number,
          resolution,
        );
        break;
      case INDICATOR_TYPES.DEFORESTATION:
        riskMap = await this.h3DataRepository.getDeforestationLossRiskMapByResolution(
          indicatorH3Data,
          materialH3Data as H3Data,
          resolution,
        );
        break;
      case INDICATOR_TYPES.CARBON_EMISSIONS:
        riskMap = await this.h3DataRepository.getCarbonEmissionsRiskMapByResolution(
          indicatorH3Data,
          materialH3Data as H3Data,
          factor as number,
          resolution,
        );
        break;
      case INDICATOR_TYPES.BIODIVERSITY_LOSS:
        riskMap = await this.h3DataRepository.getBiodiversityLossRiskMapByResolution(
          indicatorH3Data,
          materialH3Data as H3Data,
          factor as number,
          resolution,
        );
        break;
      default:
        throw new ServiceUnavailableException(
          `Risk map for indicator ${indicator.name} (indicator nameCode ${indicator.nameCode}) not currently supported`,
        );
    }

    const quantiles: number[] = await this.h3DataRepository.calculateQuantiles(
      materialH3Data as H3Data,
    );

    return {
      data: riskMap,
      metadata: { quantiles: quantiles, unit: indicator.unit.symbol },
    };
  }

  async getYearsByLayerType(
    layerType: string,
    materialId?: string,
    indicatorId?: string,
  ): Promise<number[]> {
    return this.filterYearsByLayerService.getYearsByLayerType(
      layerType,
      materialId,
      indicatorId,
    );
  }
}
