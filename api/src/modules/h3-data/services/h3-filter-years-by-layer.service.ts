/**
 * @note: Wrapper to retrieve years for which data is available by layer type.
 * First step to refactor and separate functionality for H3 Module
 *
 */

import { Injectable } from '@nestjs/common';
import { LAYER_TYPES } from 'modules/h3-data/h3-data.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { MaterialsService } from 'modules/materials/materials.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';

@Injectable()
export class H3FilterYearsByLayerService {
  constructor(
    @InjectRepository(H3DataRepository)
    protected readonly h3DataRepository: H3DataRepository,
    protected readonly materialService: MaterialsService,
    private readonly indicatorService: IndicatorsService,
    private readonly sourcingRecordService: SourcingRecordsService,
  ) {}
  async getYearsByLayer(
    layerType: string,
    materialId?: string,
    indicatorId?: string,
  ): Promise<number[]> {
    /**
     * @debt: If layerType equals to 'impact', we can retrieve available years in sourcing-records entity
     * For the rest of layer types, we currently send a hardcoded value since there is nothing yet filling this data
     * and it will always return an empty array
     * H3Data table updated to store years, implement the real thing as soons as data-import process can provide said data
     *
     */
    switch (layerType) {
      case LAYER_TYPES.IMPACT:
        return this.getAvailableYearsForImpactLayer();
      case LAYER_TYPES.MATERIAL:
        return this.getAvailableYearsForMaterialLayer(layerType, materialId);
      case LAYER_TYPES.RISK:
        return this.getAvailableYearsForRiskLayer(layerType, indicatorId);
      default:
        throw new Error(
          `Available years for Layer: ${layerType} could not been retrieved`,
        );
    }
  }

  async getAvailableYearsForMaterialLayer(
    layerType: LAYER_TYPES,
    materialId?: string,
  ): Promise<number[]> {
    if (materialId) {
      const { harvestId, producerId } = await this.materialService.getById(
        materialId as string,
      );
      return this.h3DataRepository.getYears({
        layerType,
        harvestId,
        producerId,
      });
    } else {
      return this.h3DataRepository.getYears({ layerType });
    }
  }

  async getAvailableYearsForRiskLayer(
    layerType: LAYER_TYPES,
    indicatorId?: string,
  ): Promise<number[]> {
    if (indicatorId) {
      return this.h3DataRepository.getYears({ layerType, indicatorId });
    } else {
      return this.h3DataRepository.getYears({ layerType });
    }
  }

  /**
   * Return all available years in Sourcing-Locations, which represent available years for Impact Layer
   */
  async getAvailableYearsForImpactLayer(): Promise<number[]> {
    return this.sourcingRecordService.getYears();
  }
}
