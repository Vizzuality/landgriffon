import { Injectable } from '@nestjs/common';
import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';
import { paramsToQueryInjector } from 'utils/helpers/params-to-query-injector.helper';

// TODO: All dependencies below should be ideally translated to queryBuilders

const dependenciesForInterventions: any = {
  production: `sum_material_over_georegion($1, $2, 'producer') as production`,
  harvestedArea: `sum_material_over_georegion($1, $2, 'harvest') as "harvestedArea"`,
  weightedAllHarvest: `sum_h3_weighted_cropland_area($1, $2, 'producer') as "weightedAllHarvest"`,
  rawDeforestation: `sum_weighted_deforestation_over_georegion($1, $2, 'producer') as "rawDeforestation"`,
  rawCarbon: `sum_weighted_carbon_over_georegion($1, $2, 'producer') as "rawCarbon"`,
  rawWater: `get_blwf_impact($3, $2) as "rawWater"`,
  waterStressPerct: `get_percentage_water_stress_area($1) as "waterStressPerct"`,
  satDeforestation: ` sum_satelligence_deforestation_over_georegion($1) as "satDeforestation"`,
  satDeforestationRisk: `sum_satelligence_deforestation_risk_over_georegion($1) as "satDeforestationRisk"`,
};

// landUse needs: landPerTon and tonnage
// deforestation needs weightedAllHarvest + rawDeforestation + tonnage
// carbonLoss needs weightedAllHarvest + rawCarbon + tonnage
// waterUse needs rawData + tonnage
// unsustainable water use needs waterUse(indicator) + waterstreesperct
const indicatorVSRawValueDependencies: any = {
  [INDICATOR_TYPES.LAND_USE]: {
    production: dependenciesForInterventions['production'],
    harvestedArea: dependenciesForInterventions['harvestedArea'],
  },
  [INDICATOR_TYPES.DEFORESTATION_RISK]: {
    rawDeforestation: dependenciesForInterventions['rawDeforestation'],
    weightedAllHarvest: dependenciesForInterventions['weightedAllHarvest'],
  },
  [INDICATOR_TYPES.CLIMATE_RISK]: {
    rawCarbon: dependenciesForInterventions['rawCarbon'],
    weightedAllHarvest: dependenciesForInterventions['weightedAllHarvest'],
  },
  [INDICATOR_TYPES.WATER_USE]: {
    rawWater: dependenciesForInterventions['rawWater'],
    weightedAllHarvest: dependenciesForInterventions['weightedAllHarvest'],
  },
  [INDICATOR_TYPES.UNSUSTAINABLE_WATER_USE]: {
    waterStressPerct: dependenciesForInterventions['waterStressPerct'],
    rawWater: dependenciesForInterventions['rawWater'],
  },
  [INDICATOR_TYPES.SATELLIGENCE_DEFORESTATION]: {
    satDeforestation: dependenciesForInterventions['satDeforestation'],
  },
  [INDICATOR_TYPES.SATELLIGENCE_DEFORESTATION_RISK]: {
    satDeforestationRisk: dependenciesForInterventions['satDeforestationRisk'],
  },
};

@Injectable()
export class IndicatorDependencyManager {
  /**
   * @description: Returns the query (stored procedure) needed to calculate the given raw value for a indicator
   * TODO: This should be (again) translated to api logic as it is in (WIP) https://github.com/Vizzuality/landgriffon/pull/591
   */

  buildQueryForIntervention(nameCodes: INDICATOR_TYPES[]): any {
    const queries: any[] = [];
    for (const nameCode of nameCodes) {
      queries.push(...Object.values(indicatorVSRawValueDependencies[nameCode]));
    }
    return [...new Set(queries)].join(', ');
  }

  buildQueryForImport(nameCodes: INDICATOR_TYPES[]): {
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
