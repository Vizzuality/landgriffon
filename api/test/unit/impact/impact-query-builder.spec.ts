import { IndicatorStrategyFactory } from 'modules/impact/calculation/indicator.strategy.factory';
import {
  Indicator,
  INDICATOR_NAME_CODES,
} from 'modules/indicators/indicator.entity';
import { ImpactQueryBuilderV2 } from '../../../src/modules/impact/calculation/impact-calculation.query.builder';

describe('ImpactQueryBuilder integration using strategies from Strategy Factory', () => {
  let strategyFactory: IndicatorStrategyFactory;
  let queryBuilder: ImpactQueryBuilderV2;

  beforeEach(() => {
    strategyFactory = new IndicatorStrategyFactory();
    queryBuilder = new ImpactQueryBuilderV2();
  });

  test('should generate selects and queries based on indicator strategies', () => {
    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.WW },
      { nameCode: INDICATOR_NAME_CODES.DF_SLUC },
    ] as Indicator[];

    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );

    const impactQuery = queryBuilder.buildQuery(
      strategies.getQueryDependencies(),
    );
    // TODO add matchers to check it injects the correct dependencies: aliases and queries. No point in checking the  whole query as it will change
  });
  test('should generate query fragment correctly for a single active indicator (LF)', () => {
    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.WW },
    ] as Indicator[];
    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );
    const impactQuery = queryBuilder.buildQuery(
      strategies.getQueryDependencies(),
    );
    expect(impactQuery).toContain('harvest');
    expect(impactQuery).toContain('production');
    expect(impactQuery).not.toContain('DF_SLUC');
  });

  test('should deduplicate query fragments when duplicate indicators are active', () => {
    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.LF },
      { nameCode: INDICATOR_NAME_CODES.LF },
      { nameCode: INDICATOR_NAME_CODES.DF_SLUC },
      { nameCode: INDICATOR_NAME_CODES.DF_SLUC },
      { nameCode: INDICATOR_NAME_CODES.DF_SLUC },
    ] as Indicator[];
    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );
    const impactQuery = queryBuilder.buildQuery(
      strategies.getQueryDependencies(),
    );

    const productionMatches = (impactQuery.match(/as "production"/g) || [])
      .length;
    const harvestMatches = (impactQuery.match(/as "harvest"/g) || []).length;
    const dfSlucMatches = (impactQuery.match(/as "DF_SLUC"/g) || []).length;

    expect(productionMatches).toBe(1);
    expect(harvestMatches).toBe(1);
    expect(dfSlucMatches).toBe(1);
  });

  // TODO: Right now this is the approach but it might change after refactoring
  test('should not include LF indicator select key as this is calculated internally', () => {
    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.LF },
      { nameCode: INDICATOR_NAME_CODES.WW },
    ] as Indicator[];
    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );
    const impactQuery = queryBuilder.buildQuery(
      strategies.getQueryDependencies(),
    );

    expect(impactQuery).not.toContain('LF');
  });

  test('should inject keys correctly replacing placeholders', () => {
    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.DF_SLUC },
      { nameCode: INDICATOR_NAME_CODES.WW },
      { nameCode: INDICATOR_NAME_CODES.NL },
    ] as Indicator[];
    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );
    const impactQuery = queryBuilder.buildQuery(
      strategies.getQueryDependencies(),
    );

    expect(impactQuery).toContain('sourcing_location."geoRegionId"');
    expect(impactQuery).toContain('sourcing_location."adminRegionId"');
    expect(impactQuery).toContain('sourcing_location."materialId"');

    expect(impactQuery).not.toContain('$1');
    expect(impactQuery).not.toContain('$2');
    expect(impactQuery).not.toContain('$3');
  });
});

// Helper function to normalize strings to assert equality
function normalize(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

const expectedQuery = `
  SELECT DISTINCT ON (sr.id)
            sr.id as "sourcingRecordId",
            sr.tonnage,
            sr.year,
            slwithmaterialh3data.id as "sourcingLocationId",
            slwithmaterialh3data."materialH3DataId",
            "harvest",
            "production",
            DF_SLUC, WW
          FROM sourcing_records sr
          INNER JOIN (
            SELECT
              sourcing_location.id,
              "scenarioInterventionId",
              "interventionType",
              mth."h3DataId" as "materialH3DataId", get_annual_commodity_weighted_impact_over_georegion(sourcing_location."geoRegionId", 'DF_SLUC',sourcing_location."materialId", 'producer') as "DF_SLUC", sum_material_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'producer') as "production", sum_material_over_georegion(sourcing_location."geoRegionId", sourcing_location."materialId", 'harvest') as "harvest", get_indicator_coefficient_impact('WW', sourcing_location."adminRegionId", sourcing_location."materialId") as "WW"
            FROM sourcing_location
            INNER JOIN material_to_h3 mth
              ON mth."materialId" = sourcing_location."materialId"
            WHERE "scenarioInterventionId" IS NULL
              AND "interventionType" IS NULL
              AND mth."type" = 'producer'
          ) as slwithmaterialh3data
          ON sr."sourcingLocationId" = slwithmaterialh3data.id;
        ;
  `;
