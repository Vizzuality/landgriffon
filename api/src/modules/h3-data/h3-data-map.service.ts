import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';

/**
 * @debt: Check if we actually need extending nestjs-base-service over this module.
 * We should not need performing CRUD operations. Even if we want filtering capabilities
 * by abstraction (via nestjs-base-service), check if we can apply to the actual target tables since are not related to this entity

 */
@Injectable()
export class H3DataMapService {
  logger: Logger = new Logger(H3DataMapService.name);

  constructor(
    protected readonly h3DataRepository: H3DataRepository,
    protected readonly materialService: MaterialsService,
    protected readonly materialToH3Service: MaterialsToH3sService,
    protected readonly adminRegionService: AdminRegionsService,
    protected readonly supplierService: SuppliersService,
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

    //Get the corresponding map data depending on the incoming DTO
    if (getImpactMapDto instanceof GetScenarioVsScenarioImpactMapDto) {
      impactMap = await this.h3DataRepository.getScenarioVsScenarioImpactMap(
        getImpactMapDto,
      );
    } else if (getImpactMapDto instanceof GetActualVsScenarioImpactMapDto) {
      impactMap = await this.h3DataRepository.getActualVsScenarioImpactMap(
        getImpactMapDto,
      );
    } else {
      impactMap = await this.h3DataRepository.getImpactMap(getImpactMapDto);
    }

    return this.constructH3MapResponse(
      impactMap.impactMap,
      impactMap.quantiles,
      indicator,
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

    if (mapDto.supplierIds) {
      mapDto.supplierIds = await this.supplierService.getSuppliersDescendants(
        mapDto.supplierIds,
      );
    }

    if (mapDto.materialIds) {
      mapDto.materialIds = await this.materialService.getMaterialsDescendants(
        mapDto.materialIds,
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

  private constructH3MapResponse(
    impactMap: H3IndexValueData[],
    quantiles: number[],
    indicator: Indicator,
    materialsH3DataYears: MaterialsH3DataYears[],
  ): H3MapResponse {
    return {
      data: impactMap,
      metadata: {
        quantiles: quantiles,
        unit: indicator.unit.symbol,
        ...(materialsH3DataYears.length ? { materialsH3DataYears } : {}),
      },
    };
  }
}
