import { Injectable } from '@nestjs/common';
import { INDICATOR_TYPES_NEW } from 'modules/indicators/indicator.entity';
import { paramsToQueryInjector } from 'utils/helpers/params-to-query-injector.helper';

// TODO: All dependencies below should be ideally translated to queryBuilders

const dependenciesForImport: any = {
  production: `sum_material_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'producer') as production`,
  harvestedArea: `sum_material_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'harvest') as "harvestedArea"`,
  weightedAllHarvest: ` sum_h3_weighted_cropland_area(sourcing_location."geoRegionId", sourcing_location."materialId", 'producer') as "weightedAllHarvest"`,
  rawDeforestation: `sum_weighted_deforestation_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'producer') as "rawDeforestation"`,
  rawCarbon: ` sum_weighted_carbon_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'producer') as "rawCarbon"`,
  rawWater: `get_blwf_impact(sourcing_location."adminRegionId", sourcing_location."materialId") as "rawWater"`,
  waterStressPerct: `get_blwf_impact(sourcing_location."adminRegionId", sourcing_location."materialId") as "rawWater"`,
};

const dependenciesForInterventions: any = {
  production: `sum_material_over_georegion($1, $2, 'producer') as production`,
  harvestedArea: `sum_material_over_georegion($1, $2, 'harvest') as "harvestedArea"`,
  weightedAllHarvest: `sum_h3_weighted_cropland_area($1, $2, 'producer') as "weightedAllHarvest"`,
  rawDeforestation: `sum_weighted_deforestation_over_georegion($1, $2, 'producer') as "rawDeforestation"`,
  rawCarbon: `sum_weighted_carbon_over_georegion($1, $2, 'producer') as "rawCarbon"`,
  rawWater: `get_blwf_impact($3, $2) as "rawWater"`,
  waterStressPerct: `get_percentage_water_stress_area($1) as "waterStressPerct"`,
};

// landUse needs: landPerTon and tonnage
// deforestation needs weightedAllHarvest + rawDeforestation + tonnage
// carbonLoss needs weightedAllHarvest + rawCarbon + tonnage
// waterUse needs rawData + tonnage
// unsustainable water use needs waterUse(indicator) + waterstreesperct
const indicatorVSRawValueDependencies: any = {
  [INDICATOR_TYPES_NEW.LAND_USE]: {
    production: dependenciesForInterventions['production'],
    harvestedArea: dependenciesForInterventions['harvestedArea'],
  },
  [INDICATOR_TYPES_NEW.DEFORESTATION_RISK]: {
    rawDeforestation: dependenciesForInterventions['rawDeforestation'],
    weightedAllHarvest: dependenciesForInterventions['weightedAllHarvest'],
  },
  [INDICATOR_TYPES_NEW.CLIMATE_RISK]: {
    rawCarbon: dependenciesForInterventions['rawCarbon'],
    weightedAllHarvest: dependenciesForInterventions['weightedAllHarvest'],
  },
  [INDICATOR_TYPES_NEW.WATER_USE]: {
    rawWater: dependenciesForInterventions['rawWater'],
    weightedAllHarvest: dependenciesForInterventions['weightedAllHarvest'],
  },
  [INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE]: {
    waterStressPerct: dependenciesForInterventions['waterStressPerct'],
    rawWater: dependenciesForInterventions['rawWater'],
  },
};

export const INDICATOR_TO_RAW_VALUES: any = {
  [INDICATOR_TYPES_NEW.LAND_USE]: ['production', 'harvestedArea'],
  [INDICATOR_TYPES_NEW.DEFORESTATION_RISK]: [
    'rawDeforestation',
    'weightedAllHarvest',
  ],
  [INDICATOR_TYPES_NEW.CLIMATE_RISK]: ['rawCarbon', 'weightedAllHarvest'],
  [INDICATOR_TYPES_NEW.WATER_USE]: ['rawWater', 'weightedAllHarvest'],
  [INDICATOR_TYPES_NEW.UNSUSTAINABLE_WATER_USE]: [
    'waterStressPerct',
    'rawWater',
  ],
};

@Injectable()
export class IndicatorDependencyManager {
  /**
   * @description: Returns the query (stored procedure) needed to calculate the given raw value for a indicator
   * TODO: This should be (again) translated to api logic as it is in (WIP) https://github.com/Vizzuality/landgriffon/pull/591
   */
  getQueryForImport(type: any): string {
    return dependenciesForImport[type];
  }

  getQueryForIntervention(type: any): string {
    return dependenciesForImport[type];
  }

  buildQueryForIntervention(nameCodes: INDICATOR_TYPES_NEW[]): any {
    const queries: any[] = [];
    for (const nameCode of nameCodes) {
      queries.push(...Object.values(indicatorVSRawValueDependencies[nameCode]));
    }
    return [...new Set(queries)].join(', ');
  }

  buildQueryForImport(nameCodes: INDICATOR_TYPES_NEW[]): {
    params: string;
    query: string;
  } {
    const importQueryFields: string[] = [
      `sourcing_location."geoRegionId"`,
      `sourcing_location."materialId"`,
      `sourcing_location."adminRegionId"`,
    ];
    const queries: any[] = [];
    const params: string[] = [];

    for (const nameCode of nameCodes) {
      params.push(...Object.keys(indicatorVSRawValueDependencies[nameCode]));
      queries.push(...Object.values(indicatorVSRawValueDependencies[nameCode]));
    }
    return {
      params: [...new Set(params)]
        .map((param: string) => `"${param}"`)
        .join(', '),
      query: paramsToQueryInjector(
        importQueryFields,
        [...new Set(queries)].join(', '),
      ),
    };
  }
}
