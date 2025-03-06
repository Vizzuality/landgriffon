import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { INDICATOR_NAME_CODES } from '../../indicators/indicator.entity';
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

type IndicatorH3DataSourceMap = Map<
  INDICATOR_NAME_CODES,
  IndicatorH3DataSource
>;

export type SourcingLocationDependency = {
  sourcingLocationId: string;
  materialH3DataSourceMap: {
    production: MaterialH3DataSource;
    harvest: MaterialH3DataSource;
  };
  geoRegionH3IndexList: GeoRegionH3IndexList;
  indicatorH3DataSourceDependencyMap: IndicatorH3DataSourceMap;
};

@Injectable()
export class ImpactPerLocationDependencyBuilder {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly impactRepo: ImpactCalculationRepository,
  ) {}

  async buildDependencyMap(
    activeIndicatorNamecodes: INDICATOR_NAME_CODES[],
  ): Promise<SourcingLocationDependency[]> {
    const spatialIndicators = activeIndicatorNamecodes.filter(
      (indicatorNameCode) =>
        SPATIAL_INDICATOR_NAME_CODES.includes(indicatorNameCode),
    );
    const indicatorH3DataSourceDependencyMap =
      await this.getIndicatorH3DataSourceDependencies(spatialIndicators);

    // TODO: Might need to do in batches? The number of elements (right now max 40k, but can be bigger) might not be too much, but adding all dependencies
    //       specially the georegion h3 indices might be too much. We need to check this.
    const sourcingLocations: SourcingLocation[] = await this.dataSource
      .getRepository(SourcingLocation)
      .find();

    const materialH3DataSourceMap = new Map<
      string,
      {
        production: MaterialH3DataSource;
        harvest: MaterialH3DataSource;
      }
    >();
    const georegionH3IndexMap = new Map<string, GeoRegionH3IndexList>();

    const sourcingLocationDependencies: SourcingLocationDependency[] = [];
    for (const location of sourcingLocations) {
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

      const dependencies: SourcingLocationDependency = {
        sourcingLocationId: location.id,
        materialH3DataSourceMap: materialH3DataSourceMap.get(materialId.value)!,
        geoRegionH3IndexList: georegionH3IndexMap.get(geoRegionId.value)!,
        indicatorH3DataSourceDependencyMap,
      };
      sourcingLocationDependencies.push(dependencies);
    }
    return sourcingLocationDependencies;
  }

  // TODO: Important, not all indicators have a h3 datasource, only the spatial ones. Some of them use the indicator coefficient tables.
  //       We need to handle this gracefully. For now I will get the h3 datasource for the spatial indicators.

  //
  async getIndicatorH3DataSourceDependencies(
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
}
