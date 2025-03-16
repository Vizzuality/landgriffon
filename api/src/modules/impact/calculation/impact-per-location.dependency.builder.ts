import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from '../../indicators/indicator.entity';
import {
  GeoRegionH3IndexList,
  ImpactCalculationRepository,
  IndicatorH3DataSource,
  MaterialH3DataSource,
} from './impact-calculation.repository';
import { SourcingLocation } from '../../sourcing-locations/sourcing-location.entity';
import {
  GeoRegionId,
  MaterialId,
} from './queries/production-and-harvest.query';
import { MATERIAL_TO_H3_TYPE } from '../../materials/material-to-h3.entity';
import {
  AdminRegionId,
  IndicatorId,
} from './queries/indicator-coefficient-impact.query';

/**
 * @description: Builds all dependencies to calculate all required impacts by location.
 *               Until now, for each location and for each impact, we are running a lot of redundant queries.
 *               i.e: get indicator id by name code, get h3 datasources for material, indicator by material id, type, namecode...
 *               and specially uncompacting h3 indices for each location.
 *
 *               The aim is to build some kind of map that for each location, it has all the required data to calculate all impacts.
 *               Additionally, for the same material and georegion, we can reuse the h3 datasource if those were already found
 */

const SPATIAL_INDICATOR_NAME_CODES = [
  INDICATOR_NAME_CODES.DF_SLUC,
  INDICATOR_NAME_CODES.ENL,
  INDICATOR_NAME_CODES.FLIL,
  INDICATOR_NAME_CODES.GHG_DEF_SLUC, // this one uses matertial-to-indicator!
  INDICATOR_NAME_CODES.GHG_FARM,
  INDICATOR_NAME_CODES.NCE,
  INDICATOR_NAME_CODES.UWU,
  INDICATOR_NAME_CODES.WGUWU,
];

export type IndicatorH3DataSourceMap = Map<
  INDICATOR_NAME_CODES,
  IndicatorH3DataSource
>;

/**
 * @description: All required data to calculate impact for a specific location. It needs to have the h3 list of the georegion, the h3 datasources for the material,
 *              and the h3 datasource for all the indicators we need to calculate impact for.
 */

export type IndicatorDependency = {
  spatial: IndicatorH3DataSourceMap;
  coefficient: { nameCode: INDICATOR_NAME_CODES; id: IndicatorId }[];
};

export type DependenciesToCalculateImpact = {
  sourcingLocationId: string;
  adminRegionId: AdminRegionId;
  materialId: MaterialId;
  materialH3DataSourceMap: {
    production: MaterialH3DataSource;
    harvest: MaterialH3DataSource;
  };
  indicatorDependencies: IndicatorDependency;
  geoRegionH3IndexList: GeoRegionH3IndexList;
};

@Injectable()
export class ImpactPerLocationDependencyBuilder {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly impactRepo: ImpactCalculationRepository,
  ) {}

  async buildDependencyMap(
    locations: SourcingLocation[],
    indicatorDependencies: IndicatorDependency,
  ): Promise<DependenciesToCalculateImpact[]> {
    // TODO: Might need to do in batches? The number of elements (right now max 40k, but can be bigger) might not be too much, but adding all dependencies
    //       specially the georegion h3 indices might be too much. We need to check this.

    const materialH3DataSourceMap = new Map<
      string,
      {
        production: MaterialH3DataSource;
        harvest: MaterialH3DataSource;
      }
    >();
    const georegionH3IndexMap = new Map<string, GeoRegionH3IndexList>();

    const sourcingLocationDependencies: DependenciesToCalculateImpact[] = [];
    for (const location of locations) {
      const adminRegionId = new AdminRegionId(location.adminRegionId);
      const materialId = new MaterialId(location.materialId);
      const geoRegionId = new GeoRegionId(location.geoRegionId);
      const materialH3DataSource = materialH3DataSourceMap.get(
        materialId.value,
      );
      if (!materialH3DataSource) {
        const production = await this.impactRepo.getMaterialH3DataSource(
          materialId,
          MATERIAL_TO_H3_TYPE.PRODUCER,
        );
        const harvest = await this.impactRepo.getMaterialH3DataSource(
          materialId,
          MATERIAL_TO_H3_TYPE.HARVEST,
        );

        materialH3DataSourceMap.set(materialId.value, { production, harvest });
      }
      const geoRegionH3IndexList = georegionH3IndexMap.get(geoRegionId.value);
      if (!geoRegionH3IndexList) {
        const h3Indices = await this.impactRepo.getGeoRegionH3IndexList({
          geoRegionId,
        });
        georegionH3IndexMap.set(geoRegionId.value, h3Indices);
      }

      const dependencies: DependenciesToCalculateImpact = {
        adminRegionId: adminRegionId,
        sourcingLocationId: location.id,
        materialId: materialId,
        materialH3DataSourceMap: materialH3DataSourceMap.get(materialId.value)!,
        geoRegionH3IndexList: georegionH3IndexMap.get(geoRegionId.value)!,
        indicatorDependencies,
      };
      sourcingLocationDependencies.push(dependencies);
    }
    return sourcingLocationDependencies;
  }

  // TODO: Important, not all indicators have a h3 datasource, only the spatial ones. Some of them use the indicator coefficient tables.
  //       We need to handle this gracefully. For now I will get the h3 datasource for the spatial indicators.

  //
  async getSpatialIndicatorDataSources(
    spatialIndicatorNameCodes: INDICATOR_NAME_CODES[],
  ): Promise<IndicatorH3DataSourceMap> {
    const indicatorH3DataSourceMap = new Map<
      INDICATOR_NAME_CODES,
      IndicatorH3DataSource
    >();
    for (const indicatorNameCode of spatialIndicatorNameCodes) {
      const indicatorH3DataSource =
        await this.impactRepo.getIndicatorH3DataSource(indicatorNameCode);
      indicatorH3DataSourceMap.set(indicatorNameCode, indicatorH3DataSource);
    }
    return indicatorH3DataSourceMap;
  }

  /**
   * @desccription: Coefficient Indicators do not depend on spatial data so that they don't have a h3 datasource. It's a table lookup
   *                For that, we need the material id, admin region id that comes with the location, and the ids for the coefficient indicators
   *                If we agreee on removing the Indicator UUID, and use the nameCode as the ID as we should, this would not be required
   */

  async buildCoefficientIndicatorDependencies(
    coefficientIndicatorNameCodes: INDICATOR_NAME_CODES[],
  ): Promise<{ nameCode: INDICATOR_NAME_CODES; id: IndicatorId }[]> {
    const coefficientIndicators = await this.dataSource
      .getRepository(Indicator)
      .find({ where: { nameCode: In(coefficientIndicatorNameCodes) } });

    return coefficientIndicators.map((indicator) => ({
      nameCode: indicator.nameCode,
      id: new IndicatorId(indicator.id),
    }));
  }

  async buildIndicatorDependencies(
    activeIndicatorNameCodes: INDICATOR_NAME_CODES[],
  ): Promise<IndicatorDependency> {
    const spatialIndicators = activeIndicatorNameCodes.filter(
      (indicatorNameCode) =>
        SPATIAL_INDICATOR_NAME_CODES.includes(indicatorNameCode),
    );

    const coefficientIndicators = activeIndicatorNameCodes.filter(
      (indicatorNameCode) =>
        !SPATIAL_INDICATOR_NAME_CODES.includes(indicatorNameCode),
    );

    // We can do this just once, as they won't change for all locations, the datasources of the indicator will remain the same for all locations
    // IMPORTANT: Below only the spatial indicators have a h3 datasource, the others use the indicator coefficient tables. We need to handle this
    const indicatorH3DataSourceDependencyMap =
      await this.getSpatialIndicatorDataSources(spatialIndicators);

    const coefficientIndicatorsDependencies =
      await this.buildCoefficientIndicatorDependencies(coefficientIndicators);

    return {
      spatial: indicatorH3DataSourceDependencyMap,
      coefficient: coefficientIndicatorsDependencies,
    };
  }
}
