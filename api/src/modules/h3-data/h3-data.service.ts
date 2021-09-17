import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { MaterialsService } from 'modules/materials/materials.service';
import { RiskMapService } from 'modules/risk-map/risk-map.service';

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
    protected readonly riskMapService: RiskMapService,
  ) {}

  /**
   * Find one H3 full data by its name
   */
  async findH3ByName(
    h3TableName: string,
    h3ColumnName: string,
  ): Promise<H3IndexValueData> {
    return await this.h3DataRepository.findH3ByName(h3TableName, h3ColumnName);
  }

  async getMaterialH3ByResolution(
    materialId: string,
    resolution: number,
  ): Promise<H3IndexValueData> {
    const material = await this.materialService.getMaterialById(materialId);
    if (!material.h3Grid)
      throw new NotFoundException(
        `No H3 Data available for Material: ${material.name}`,
      );
    return await this.h3DataRepository.getH3ByIdAndResolution(
      material.h3GridId,
      resolution,
    );
  }

  async calculateRiskMapByMaterialAndIndicator(
    indicatorH3Data: H3Data,
    materialH3Data: H3Data,
    calculusFactor: number,
  ): Promise<H3IndexValueData> {
    return await this.h3DataRepository.calculateRiskMapByMaterialAndIndicator(
      indicatorH3Data,
      materialH3Data,
      calculusFactor,
    );
  }
}
