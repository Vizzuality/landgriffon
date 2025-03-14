import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import {
  get_annual_commodity_weighted_impact_over_georegion,
  get_indicator_coefficient_impact,
} from 'procedures/stored-prodecures';

/**
 * @description Database level dependencies for computing raw values for indicators
 *
 * @note: This could use a second thought, but time is tight
 *
 */

export class QueryPropertyNamesType {
  production: 'production';
  harvest: 'harvest';
  [INDICATOR_NAME_CODES.LF]: INDICATOR_NAME_CODES.LF;
  [INDICATOR_NAME_CODES.DF_SLUC]: INDICATOR_NAME_CODES.DF_SLUC;
  [INDICATOR_NAME_CODES.GHG_DEF_SLUC]: INDICATOR_NAME_CODES.GHG_DEF_SLUC;
  [INDICATOR_NAME_CODES.UWU]: INDICATOR_NAME_CODES.UWU;
  [INDICATOR_NAME_CODES.WU]: INDICATOR_NAME_CODES.WU;
  [INDICATOR_NAME_CODES.NL]: INDICATOR_NAME_CODES.NL;
  [INDICATOR_NAME_CODES.NCE]: INDICATOR_NAME_CODES.NCE;
  [INDICATOR_NAME_CODES.FLIL]: INDICATOR_NAME_CODES.FLIL;
  [INDICATOR_NAME_CODES.GHG_FARM]: INDICATOR_NAME_CODES.GHG_FARM;
  [INDICATOR_NAME_CODES.WW]: INDICATOR_NAME_CODES.WW;
  [INDICATOR_NAME_CODES.WC]: INDICATOR_NAME_CODES.WC;
  [INDICATOR_NAME_CODES.WGUWU]: INDICATOR_NAME_CODES.WGUWU;
  [INDICATOR_NAME_CODES.WGSWU_NEW]: INDICATOR_NAME_CODES.WGSWU_NEW;
}

export class QueryPropertyTypes {
  production: number;
  harvest: number;
  [INDICATOR_NAME_CODES.LF]: number;
  [INDICATOR_NAME_CODES.DF_SLUC]: number;
  [INDICATOR_NAME_CODES.GHG_DEF_SLUC]: number;
  [INDICATOR_NAME_CODES.UWU]: number;
  [INDICATOR_NAME_CODES.WU]: number;
  [INDICATOR_NAME_CODES.NL]: number;
  [INDICATOR_NAME_CODES.FLIL]: number;
  [INDICATOR_NAME_CODES.NCE]: number;
  [INDICATOR_NAME_CODES.ENL]: number;
  [INDICATOR_NAME_CODES.GHG_FARM]: number;
  [INDICATOR_NAME_CODES.WW]: number;
  [INDICATOR_NAME_CODES.WC]: number;
  [INDICATOR_NAME_CODES.WGUWU]: number;
  // TODO: The implementation of the new indicator breaks our current pattern of having a single query/value coming from the database.
  //      This becomes quite problematic, but since we plan to refactor the whole impact calculation process, we can leave it as is for now.
  [INDICATOR_NAME_CODES.WGSWU_NEW]: number;
  BWS_IN_STRESSED_AREAS: number;
  STRESSED_AREA_PORTION: number;
}

export const QueryPropertyNames: QueryPropertyNamesType = {
  production: 'production',
  harvest: 'harvest',
  [INDICATOR_NAME_CODES.LF]: INDICATOR_NAME_CODES.LF,
  [INDICATOR_NAME_CODES.DF_SLUC]: INDICATOR_NAME_CODES.DF_SLUC,
  [INDICATOR_NAME_CODES.GHG_DEF_SLUC]: INDICATOR_NAME_CODES.GHG_DEF_SLUC,
  [INDICATOR_NAME_CODES.UWU]: INDICATOR_NAME_CODES.UWU,
  [INDICATOR_NAME_CODES.WU]: INDICATOR_NAME_CODES.WU,
  [INDICATOR_NAME_CODES.NL]: INDICATOR_NAME_CODES.NL,
  [INDICATOR_NAME_CODES.NCE]: INDICATOR_NAME_CODES.NCE,
  [INDICATOR_NAME_CODES.FLIL]: INDICATOR_NAME_CODES.FLIL,
  [INDICATOR_NAME_CODES.GHG_FARM]: INDICATOR_NAME_CODES.GHG_FARM,
  [INDICATOR_NAME_CODES.WW]: INDICATOR_NAME_CODES.WW,
  [INDICATOR_NAME_CODES.WC]: INDICATOR_NAME_CODES.WC,
  [INDICATOR_NAME_CODES.WGUWU]: INDICATOR_NAME_CODES.WGUWU,
  [INDICATOR_NAME_CODES.WGSWU_NEW]: INDICATOR_NAME_CODES.WGSWU_NEW,
} as const;

export type ImpactQueryPropertyName =
  typeof QueryPropertyNames[keyof typeof QueryPropertyNames];

export type ImpactQueryExpression = string;

export type ImpactPropertyToQueryFunction = () => ImpactQueryExpression;

export const INDICATOR_NAME_CODE_TO_QUERY_MAP: {
  [key in INDICATOR_NAME_CODES]: {
    [key in any]?: ImpactPropertyToQueryFunction;
  };
} = {
  [INDICATOR_NAME_CODES.LF]: {
    harvest: () =>
      `sum_material_over_georegion($1, $2, 'harvest') as "${QueryPropertyNames.harvest}"`,
    production: () =>
      `sum_material_over_georegion($1, $2, 'producer') as "${QueryPropertyNames.production}"`,
  },
  [INDICATOR_NAME_CODES.DF_SLUC]: {
    production: () =>
      `sum_material_over_georegion($1, $2, 'producer') as "${QueryPropertyNames.production}"`,
    [INDICATOR_NAME_CODES.DF_SLUC]: () =>
      `${get_annual_commodity_weighted_impact_over_georegion}($1, '${INDICATOR_NAME_CODES.DF_SLUC}', $2, 'producer') as "${INDICATOR_NAME_CODES.DF_SLUC}"`,
  },
  [INDICATOR_NAME_CODES.GHG_DEF_SLUC]: {
    production: () =>
      `sum_material_over_georegion($1, $2, 'producer') as "${QueryPropertyNames.production}"`,
    [INDICATOR_NAME_CODES.GHG_DEF_SLUC]: () =>
      `${get_annual_commodity_weighted_impact_over_georegion}($1,'${INDICATOR_NAME_CODES.GHG_DEF_SLUC}', $2, 'producer') as "${INDICATOR_NAME_CODES.GHG_DEF_SLUC}"`,
  },
  [INDICATOR_NAME_CODES.UWU]: {
    [INDICATOR_NAME_CODES.UWU]: () =>
      `${get_annual_commodity_weighted_impact_over_georegion}($1,'${INDICATOR_NAME_CODES.UWU}', $2, 'producer') as "${INDICATOR_NAME_CODES.UWU}"`,
  },
  [INDICATOR_NAME_CODES.WU]: {
    [INDICATOR_NAME_CODES.WU]: () =>
      `${get_indicator_coefficient_impact}('${INDICATOR_NAME_CODES.WU}', $3, $2) as "${INDICATOR_NAME_CODES.WU}"`,
  },
  [INDICATOR_NAME_CODES.NL]: {
    [INDICATOR_NAME_CODES.NL]: () =>
      `${get_indicator_coefficient_impact}('${INDICATOR_NAME_CODES.NL}', $3, $2) as "${INDICATOR_NAME_CODES.NL}"`,
  },

  [INDICATOR_NAME_CODES.NCE]: {
    production: () =>
      `sum_material_over_georegion($1, $2, 'producer') as "${QueryPropertyNames.production}"`,
    [INDICATOR_NAME_CODES.NCE]: () =>
      `${get_annual_commodity_weighted_impact_over_georegion}($1, '${INDICATOR_NAME_CODES.NCE}', $2, 'producer') as "${INDICATOR_NAME_CODES.NCE}"`,
  },
  [INDICATOR_NAME_CODES.FLIL]: {
    production: () =>
      `sum_material_over_georegion($1, $2, 'producer') as "${QueryPropertyNames.production}"`,
    harvest: () =>
      `sum_material_over_georegion($1, $2, 'harvest') as "${QueryPropertyNames.harvest}"`,
    [INDICATOR_NAME_CODES.FLIL]: () =>
      `${get_annual_commodity_weighted_impact_over_georegion}($1, '${INDICATOR_NAME_CODES.FLIL}', $2, 'producer') as "${INDICATOR_NAME_CODES.FLIL}"`,
  },
  [INDICATOR_NAME_CODES.ENL]: {
    production: () =>
      `sum_material_over_georegion($1, $2, 'producer') as "${QueryPropertyNames.production}"`,
    [INDICATOR_NAME_CODES.ENL]: () =>
      `${get_annual_commodity_weighted_impact_over_georegion}($1, '${INDICATOR_NAME_CODES.ENL}', $2, 'producer') as "${INDICATOR_NAME_CODES.ENL}"`,
    [INDICATOR_NAME_CODES.NL]: () =>
      `${get_indicator_coefficient_impact}('${INDICATOR_NAME_CODES.NL}', $3, $2) as "${INDICATOR_NAME_CODES.NL}"`,
  },
  [INDICATOR_NAME_CODES.GHG_FARM]: {
    production: () =>
      `sum_material_over_georegion($1, $2, 'producer') as "${QueryPropertyNames.production}"`,
    harvest: () =>
      `sum_material_over_georegion($1, $2, 'harvest') as "${QueryPropertyNames.harvest}"`,
    [INDICATOR_NAME_CODES.GHG_FARM]: () =>
      `get_annual_commodity_weighted_material_impact_over_georegion($1, '${INDICATOR_NAME_CODES.GHG_FARM}', $2, 'producer') as "${INDICATOR_NAME_CODES.GHG_FARM}"`,
  },
  [INDICATOR_NAME_CODES.WW]: {
    [INDICATOR_NAME_CODES.WW]: () =>
      `${get_indicator_coefficient_impact}('${INDICATOR_NAME_CODES.WW}', $3, $2) as "${INDICATOR_NAME_CODES.WW}"`,
  },
  [INDICATOR_NAME_CODES.WC]: {
    [INDICATOR_NAME_CODES.WC]: () =>
      `${get_indicator_coefficient_impact}('${INDICATOR_NAME_CODES.WC}', $3, $2) as "${INDICATOR_NAME_CODES.WC}"`,
  },
  [INDICATOR_NAME_CODES.WGUWU]: {
    [INDICATOR_NAME_CODES.WGUWU]: () =>
      `${get_annual_commodity_weighted_impact_over_georegion}($1, '${INDICATOR_NAME_CODES.UWU}', $2, 'producer') as "${INDICATOR_NAME_CODES.WGUWU}"`,
    [INDICATOR_NAME_CODES.WW]: () =>
      `${get_indicator_coefficient_impact}('${INDICATOR_NAME_CODES.WW}', $3, $2) as "${INDICATOR_NAME_CODES.WW}"`,
  },
  [INDICATOR_NAME_CODES.WGSWU_NEW]: {
    [INDICATOR_NAME_CODES.WGSWU_NEW]: () =>
      `get_bws_in_stressed_areas($1, '${INDICATOR_NAME_CODES.WGSWU_NEW}', $2, 'producer') as "BWS_IN_STRESSED_AREAS", get_stressed_area_portion($1, '${INDICATOR_NAME_CODES.WGSWU_NEW}', $2, 'producer') as "STRESSED_AREA_PORTION"`,
    [INDICATOR_NAME_CODES.WW]: () =>
      `${get_indicator_coefficient_impact}('${INDICATOR_NAME_CODES.WW}', $3, $2) as "${INDICATOR_NAME_CODES.WW}"`,
  },
};
