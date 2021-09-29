import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { MaterialsService } from 'modules/materials/materials.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { UnitConversionsService } from 'modules/unit-conversions/unit-conversions.service';

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
  ): Promise<Array<H3IndexValueData>> {
    /**
     * @note To generate a Material Map, a producerId is required
     */
    const { producerId } = await this.materialService.getById(materialId);
    if (!producerId)
      throw new NotFoundException(
        `There is no H3 Data for Material with ID: ${materialId}`,
      );

    return this.h3DataRepository.getMaterialMapByResolution(
      producerId,
      resolution,
    );
  }

  async getRiskMapByResolution(
    materialId: string,
    indicatorId: string,
    resolution: number,
  ): Promise<any> {
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

    const { unit } = await this.indicatorService.getIndicatorAndUnitById(
      indicatorId,
    );

    const {
      factor,
    } = await this.unitConversionsService.getUnitConversionByUnitId(unit.id);

    return this.h3DataRepository.getRiskMapByResolution(
      indicatorH3Data,
      materialH3Data as H3Data,
      factor as number,
      resolution,
    );
  }
}
