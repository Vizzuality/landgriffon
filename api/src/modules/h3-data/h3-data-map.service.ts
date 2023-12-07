import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { MaterialsService } from 'modules/materials/materials.service';
import { IndicatorsService } from 'modules/indicators/indicators.service';
import {
  H3MapResponse,
  MaterialsH3DataYears,
} from 'modules/h3-data/dto/h3-map-response.dto';
import { Indicator } from 'modules/indicators/indicator.entity';
import { H3DataYearsService } from 'modules/h3-data/services/h3-data-years.service';
import {
  GetActualVsScenarioImpactMapDto,
  GetImpactMapDto,
  GetScenarioVsScenarioImpactMapDto,
} from 'modules/h3-data/dto/get-impact-map.dto';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import { Material } from 'modules/materials/material.entity';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { Unit } from 'modules/units/unit.entity';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';

/**
 * @debt: Check if we actually need extending nestjs-base-service over this module.
 * We should not need performing CRUD operations. Even if we want filtering capabilities
 * by abstraction (via nestjs-base-service), check if we can apply to the actual target tables since are not related to this entity

 */

// Hardcoded Units whit yet no place in DB

export const MATERIAL_UNIT: string = 'tonnes';

export const RELATIVE_UNIT_MAP_RESPONSE: string = '%';

@Injectable()
export class H3DataMapService {
  logger: Logger = new Logger(H3DataMapService.name);

  constructor(
    protected readonly h3DataRepository: H3DataRepository,
    protected readonly materialService: MaterialsService,
    protected readonly materialToH3Service: MaterialsToH3sService,
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly businessUnitsService: BusinessUnitsService,
    private readonly indicatorService: IndicatorsService,
    private readonly h3DataYearsService: H3DataYearsService,
  ) {}

  async getMaterialMapByResolutionAndYear(
    materialId: string,
    resolution: number,
    year: number,
  ): Promise<H3MapResponse> {
    /**
     * @note Currently we need to retrieve a unit to be shown on client, for a material
     * As all material-maps share the same unit, and we have no way no retrieve this unit from DB
     * as it does not exist, we hardcode it here and send it back as response
     */

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

  /**
   * Returns a map of the impact values, by year and resolution. Which data is taken into account
   * depends on the incoming dto (Actual with/without Scenario, Actual vs Scenario or Scenario vs Scenario)
   * @param getImpactMapDto
   */
  async getImpactMapByResolution(
    getImpactMapDto:
      | GetImpactMapDto
      | GetActualVsScenarioImpactMapDto
      | GetScenarioVsScenarioImpactMapDto,
  ): Promise<H3MapResponse> {
    const { indicator } = await this.loadIndicatorData(
      getImpactMapDto.indicatorId,
    );

    await this.updateDtoEntityDescendants(getImpactMapDto);

    const materialsH3DataYears: MaterialsH3DataYears[] =
      await this.getMaterialsH3DataYearsList(
        getImpactMapDto.year,
        getImpactMapDto.materialIds,
      );

    this.logger.log(`Generating impact map for indicator ${indicator.name}...`);

    let impactMap: {
      impactMap: H3IndexValueData[];
      quantiles: number[];
    };

    let isRelative: boolean = false;
    //Get the corresponding map data depending on the incoming DTO
    if (getImpactMapDto instanceof GetScenarioVsScenarioImpactMapDto) {
      impactMap = await this.h3DataRepository.getScenarioVsScenarioImpactMap(
        getImpactMapDto,
      );
      isRelative = this.isRequestedComparisonRelative(getImpactMapDto);
    } else if (getImpactMapDto instanceof GetActualVsScenarioImpactMapDto) {
      impactMap = await this.h3DataRepository.getActualVsScenarioImpactMap(
        getImpactMapDto,
      );
      isRelative = this.isRequestedComparisonRelative(getImpactMapDto);
    } else {
      impactMap = await this.h3DataRepository.getImpactMap(getImpactMapDto);
    }

    return this.constructH3MapResponse(
      impactMap.impactMap,
      impactMap.quantiles,
      indicator.unit,
      isRelative,
      materialsH3DataYears,
    );
  }

  private async loadIndicatorData(indicatorId: string): Promise<{
    indicator: Indicator;
  }> {
    const indicator: Indicator = await this.indicatorService.getIndicatorById(
      indicatorId,
    );

    if (!indicator.unit) {
      throw new NotFoundException(
        `Indicator with ID ${indicatorId} has no unit`,
      );
    }

    return { indicator };
  }

  private async updateDtoEntityDescendants(
    mapDto: GetImpactMapDto,
  ): Promise<GetImpactMapDto> {
    if (mapDto.originIds) {
      mapDto.originIds =
        await this.adminRegionService.getAdminRegionDescendants(
          mapDto.originIds,
        );
    }

    if (mapDto.materialIds) {
      mapDto.materialIds = await this.materialService.getMaterialsDescendants(
        mapDto.materialIds,
      );
    }

    if (mapDto.businessUnitIds) {
      mapDto.businessUnitIds =
        await this.businessUnitsService.getBusinessUnitsDescendants(
          mapDto.businessUnitIds,
        );
    }
    return mapDto;
  }

  private async getMaterialsH3DataYearsList(
    year: number,
    materialIds?: string[],
  ): Promise<MaterialsH3DataYears[]> {
    const materialsH3DataYears: MaterialsH3DataYears[] = [];

    if (materialIds?.length) {
      const requestedMaterials: Material[] =
        await this.materialService.getMaterialsById(materialIds);
      for (const material of requestedMaterials) {
        const materialHarvestH3DataYear: number | undefined =
          await this.h3DataYearsService.getClosestAvailableYearForMaterialH3(
            material.id,
            MATERIAL_TO_H3_TYPE.HARVEST,
            year,
          );
        const materialProducerH3DataYear: number | undefined =
          await this.h3DataYearsService.getClosestAvailableYearForMaterialH3(
            material.id,
            MATERIAL_TO_H3_TYPE.PRODUCER,
            year,
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
    return materialsH3DataYears;
  }

  /**
   * @description: Build final response. The unit shown must represent the magnitude of
   * the selected indicator, unless it's a relative comparison. Then a percentage must be shown
   *
   * @private
   */

  private constructH3MapResponse(
    impactMap: H3IndexValueData[],
    quantiles: number[],
    unit: Unit,
    comparisonIsRelative: boolean,
    materialsH3DataYears: MaterialsH3DataYears[],
  ): H3MapResponse {
    return {
      data: impactMap,
      metadata: {
        quantiles: quantiles,
        unit: comparisonIsRelative ? RELATIVE_UNIT_MAP_RESPONSE : unit.symbol,
        ...(materialsH3DataYears.length ? { materialsH3DataYears } : {}),
      },
    };
  }

  /**
   * Check if requested map's should show a relative magnitude
   */
  private isRequestedComparisonRelative(
    getImpactDto:
      | GetScenarioVsScenarioImpactMapDto
      | GetActualVsScenarioImpactMapDto,
  ): boolean {
    return getImpactDto.relative ?? false;
  }
}
