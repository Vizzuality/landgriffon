/**
 * @note: Wrapper to retrieve years for which data is available by layer type.
 * First step to refactor and separate functionality for H3 Module
 *
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { LAYER_TYPES } from 'modules/h3-data/h3-data.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { MaterialsService } from 'modules/materials/materials.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { MaterialToH3 } from 'modules/materials/material-to-h3.entity';

@Injectable()
export class H3FilterYearsByLayerService {
  constructor(
    @InjectRepository(H3DataRepository)
    protected readonly h3DataRepository: H3DataRepository,
    protected readonly materialService: MaterialsService,
    protected readonly materialToH3Service: MaterialsToH3sService,
    private readonly indicatorService: IndicatorsService,
    private readonly sourcingRecordService: SourcingRecordsService,
  ) {}

  async getYearsByLayerType(
    layerType: string,
    materialIds?: string[],
    indicatorId?: string,
  ): Promise<number[]> {
    switch (layerType) {
      case LAYER_TYPES.IMPACT:
        return this.getAvailableYearsForImpactLayer(materialIds);
      case LAYER_TYPES.MATERIAL:
        return this.getAvailableYearsForMaterialLayer(materialIds);
      case LAYER_TYPES.RISK:
        return this.getAvailableYearsForRiskLayer(indicatorId);
      default:
        throw new Error(
          `Available years for Layer: ${layerType} could not been retrieved`,
        );
    }
  }

  async getAvailableYearsForMaterialLayer(
    materialIds?: string[],
  ): Promise<number[]> {
    if (materialIds && materialIds.length > 1) {
      throw new BadRequestException(
        'Only one Material ID can be requested to filter for available years for a Material Layer type',
      );
    }

    if (materialIds?.length) {
      const materialsToH3s: MaterialToH3[] =
        await this.materialToH3Service.find({
          where: {
            materialId: materialIds[0],
          },
        });

      return this.h3DataRepository.getYears({
        layerType: LAYER_TYPES.MATERIAL,
        h3DataIds: materialsToH3s.map(
          (materialToH3: MaterialToH3) => materialToH3.h3DataId,
        ),
      });
    } else {
      return this.h3DataRepository.getYears({
        layerType: LAYER_TYPES.MATERIAL,
      });
    }
  }

  async getAvailableYearsForRiskLayer(indicatorId?: string): Promise<number[]> {
    return this.h3DataRepository.getYears({
      layerType: LAYER_TYPES.RISK,
      indicatorId,
    });
  }

  /**
   * Return all available years in Sourcing-Locations, which represent available years for Impact Layer
   */
  async getAvailableYearsForImpactLayer(
    materialIds?: string[],
  ): Promise<number[]> {
    return this.sourcingRecordService.getYears(materialIds);
  }
}
