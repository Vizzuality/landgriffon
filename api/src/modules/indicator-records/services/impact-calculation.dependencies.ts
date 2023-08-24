import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';

/**
 * @description Database level dependencies for computing raw values for indicators
 *
 * @note: This could use a second thought, but time is tight
 *
 */

export class QueryPropertyNamesType {
  production: 'production';
  harvest: 'harvest';
  rawDeforestation: 'rawDeforestation';
  rawNaturalConversion: 'rawNaturalConversion';
  rawClimateRisk: 'rawClimateRisk';
  rawWaterUse: 'rawWaterUse';
  rawUnsustainableWaterUse: 'rawUnsustainableWaterUse';
  rawWaterQuality: 'rawWaterQuality';
  satDeforestation: 'satDeforestation';
  satDeforestationRisk: 'satDeforestationRisk';
}

export class QueryPropertyTypes {
  production: number;
  harvest: number;
  rawDeforestation: number;
  rawNaturalConversion: number;
  rawClimateRisk: number;
  rawWaterUse: number;
  rawUnsustainableWaterUse: number;
  rawWaterQuality: number;
  satDeforestation: number;
  satDeforestationRisk: number;
}

export const QueryPropertyNames: QueryPropertyNamesType = {
  production: 'production',
  harvest: 'harvest',
  rawDeforestation: 'rawDeforestation',
  rawNaturalConversion: 'rawNaturalConversion',
  rawClimateRisk: 'rawClimateRisk',
  rawWaterUse: 'rawWaterUse',
  rawUnsustainableWaterUse: 'rawUnsustainableWaterUse',
  rawWaterQuality: 'rawWaterQuality',
  satDeforestation: 'satDeforestation',
  satDeforestationRisk: 'satDeforestationRisk',
} as const;

export type ImpactQueryPropertyName =
  typeof QueryPropertyNames[keyof typeof QueryPropertyNames];

export type ImpactQueryExpression = string;

export type ImpactPropertyToQueryFunction =
  | ((nameCode: INDICATOR_NAME_CODES) => ImpactQueryExpression)
  | (() => ImpactQueryExpression);

export const INDICATOR_NAME_CODE_TO_QUERY_MAP: {
  [key in INDICATOR_NAME_CODES]: {
    [key in ImpactQueryPropertyName]?: ImpactPropertyToQueryFunction;
  };
} = {
  [INDICATOR_NAME_CODES.LAND_USE]: {
    harvest: () =>
      `sum_material_over_georegion($1, $2, 'harvest') as "${QueryPropertyNames.harvest}"`,
    production: () =>
      `sum_material_over_georegion($1, $2, 'producer') as "${QueryPropertyNames.production}"`,
  },
  [INDICATOR_NAME_CODES.DEFORESTATION_RISK]: {
    production: () =>
      `sum_material_over_georegion($1, $2, 'producer') as "${QueryPropertyNames.production}"`,
    rawDeforestation: (nameCode: INDICATOR_NAME_CODES) =>
      `get_annual_landscape_impact_over_georegion($1, '${nameCode}', $2, 'producer') as "${QueryPropertyNames.rawDeforestation}"`,
  },
  [INDICATOR_NAME_CODES.CLIMATE_RISK]: {
    production: () =>
      `sum_material_over_georegion($1, $2, 'producer') as "${QueryPropertyNames.production}"`,
    rawClimateRisk: (nameCode: INDICATOR_NAME_CODES) =>
      `get_annual_landscape_impact_over_georegion($1,'${nameCode}', $2, 'producer') as "${QueryPropertyNames.rawClimateRisk}"`,
  },
  [INDICATOR_NAME_CODES.WATER_QUALITY]: {
    rawWaterQuality: (nameCode: INDICATOR_NAME_CODES) =>
      `get_indicator_coefficient_impact('${nameCode}', $3, $2) as "${QueryPropertyNames.rawWaterQuality}"`,
  },
  [INDICATOR_NAME_CODES.UNSUSTAINABLE_WATER_USE]: {
    rawUnsustainableWaterUse: (nameCode: INDICATOR_NAME_CODES) =>
      `get_percentage_water_stress_area($1, '${nameCode}') as "${QueryPropertyNames.rawUnsustainableWaterUse}"`,
  },
  [INDICATOR_NAME_CODES.NATURAL_ECOSYSTEM_CONVERSION_RISK]: {
    production: () =>
      `sum_material_over_georegion($1, $2, 'producer') as "${QueryPropertyNames.production}"`,
    rawNaturalConversion: (nameCode: INDICATOR_NAME_CODES) =>
      `get_annual_landscape_impact_over_georegion($1, '${nameCode}', $2, 'producer') as "${QueryPropertyNames.rawNaturalConversion}"`,
  },
  [INDICATOR_NAME_CODES.SATELLIGENCE_DEFORESTATION]: {
    satDeforestation: () =>
      ` sum_satelligence_deforestation_over_georegion($1) as "${QueryPropertyNames.satDeforestation}"`,
  },
  [INDICATOR_NAME_CODES.SATELLIGENCE_DEFORESTATION_RISK]: {
    satDeforestationRisk: () =>
      `sum_satelligence_deforestation_risk_over_georegion($1) as "${QueryPropertyNames.satDeforestationRisk}"`,
  },
  [INDICATOR_NAME_CODES.WATER_USE]: {
    rawWaterUse: (nameCode: INDICATOR_NAME_CODES) =>
      `get_indicator_coefficient_impact('${nameCode}', $3, $2) as "${QueryPropertyNames.rawWaterUse}"`,
  },
};
