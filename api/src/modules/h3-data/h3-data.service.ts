import { Injectable, Logger } from '@nestjs/common';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { MaterialsService } from 'modules/materials/materials.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import { UnitConversionsService } from 'modules/unit-conversions/unit-conversions.service';
import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { H3DataYearsService } from 'modules/h3-data/services/h3-data-years.service';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
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
  getH3ByName(
    h3TableName: string,
    h3ColumnName: string,
  ): Promise<H3IndexValueData[]> {
    return this.h3DataRepository.getH3ByName(h3TableName, h3ColumnName);
  }

  /**
   * Find one H3 full data by its name, for the given optional resolution
   * if no resolution is provided, the  data will have the same resolution as it stored in the DB
   */
  getSumH3ByNameAndResolution(
    h3TableName: string,
    h3ColumnName: string,
    resolution?: number,
  ): Promise<H3IndexValueData[]> {
    return this.h3DataRepository.getSumH3ByNameAndResolution(
      h3TableName,
      h3ColumnName,
      resolution,
    );
  }

  async getById(id: string): Promise<H3Data | null> {
    return await this.h3DataRepository.findOneBy({ id });
  }

  async findH3ByIndicatorId(indicatorId: string): Promise<H3Data | null> {
    return await this.h3DataRepository.findOne({ where: { indicatorId } });
  }

  findH3ByContextualLayerId(contextualLayerId: string): Promise<H3Data | null> {
    return this.h3DataRepository.findOne({ where: { contextualLayerId } });
  }

  getContextualLayerH3DataByClosestYear(
    contextualLayerId: string,
    year?: number,
  ): Promise<H3Data | undefined> {
    return this.h3DataRepository.getContextualLayerH3DataByClosestYear(
      contextualLayerId,
      year,
    );
  }

  async getAvailableYearsByLayerType(
    layerType: string,
    materialIds?: string[],
    indicatorId?: string,
  ): Promise<number[]> {
    return this.h3DataYearsService.getAvailableYearsByLayerType(
      layerType,
      materialIds,
      indicatorId,
    );
  }

  getMaterialH3ByClosestYear(
    materialId: string,
    type: MATERIAL_TO_H3_TYPE,
    year: number,
  ): Promise<H3Data | undefined> {
    return this.h3DataRepository.getMaterialH3ByTypeAndClosestYear(
      materialId,
      type,
      year,
    );
  }

  getIndicatorH3sByTypeAndClosestYear(
    indicatorTypes: INDICATOR_NAME_CODES[],
    year: number,
  ): Promise<Map<INDICATOR_NAME_CODES, H3Data>> {
    return indicatorTypes.reduce(
      async (
        previousValue: Promise<Map<INDICATOR_NAME_CODES, H3Data>>,
        currentValue: INDICATOR_NAME_CODES,
      ) => {
        const h3data: H3Data | undefined =
          await this.h3DataRepository.getIndicatorH3ByTypeAndClosestYear(
            currentValue,
            year,
          );
        const map: Map<INDICATOR_NAME_CODES, H3Data> = await previousValue;

        if (h3data) {
          map.set(currentValue, h3data);
        }

        return map;
      },
      Promise.resolve(new Map()),
    );
  }

  getAllMaterialH3sByClosestYear(
    materialId: string,
    year: number,
  ): Promise<Map<MATERIAL_TO_H3_TYPE, H3Data>> {
    return Object.values(MATERIAL_TO_H3_TYPE).reduce(
      async (
        previousValue: Promise<Map<MATERIAL_TO_H3_TYPE, H3Data>>,
        currentValue: MATERIAL_TO_H3_TYPE,
      ) => {
        const h3data: H3Data | undefined =
          await this.h3DataRepository.getMaterialH3ByTypeAndClosestYear(
            materialId,
            currentValue,
            year,
          );
        const map: Map<MATERIAL_TO_H3_TYPE, H3Data> = await previousValue;

        if (h3data) {
          map.set(currentValue, h3data);
        }

        return map;
      },
      Promise.resolve(new Map()),
    );
  }
}
