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
      { nameCode: INDICATOR_NAME_CODES.LF },
      { nameCode: INDICATOR_NAME_CODES.DF_SLUC },
    ] as Indicator[];

    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );

    const impactQuery = queryBuilder.buildQuery(strategies);
    expect(normalize(impactQuery)).toBe(normalize(expectedQuery));
  });
  test('should generate query fragment correctly for a single active indicator (LF)', () => {
    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.LF },
    ] as Indicator[];
    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );
    const impactQuery = queryBuilder.buildQuery(strategies);
    expect(impactQuery).toContain('as "harvest"');
    expect(impactQuery).toContain('as "production"');
    expect(impactQuery).not.toContain('as "DF_SLUC"');
  });

  test('should deduplicate query fragments when duplicate indicators are active', () => {
    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.LF },
      { nameCode: INDICATOR_NAME_CODES.LF },
      { nameCode: INDICATOR_NAME_CODES.DF_SLUC },
      { nameCode: INDICATOR_NAME_CODES.DF_SLUC },
    ] as Indicator[];
    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );
    const impactQuery = queryBuilder.buildQuery(strategies);

    const productionMatches = (impactQuery.match(/as "production"/g) || [])
      .length;
    const harvestMatches = (impactQuery.match(/as "harvest"/g) || []).length;
    const dfSlucMatches = (impactQuery.match(/as "DF_SLUC"/g) || []).length;

    expect(productionMatches).toBe(1);
    expect(harvestMatches).toBe(1);
    expect(dfSlucMatches).toBe(1);
  });

  test('should inject keys correctly replacing placeholders', () => {
    const activeIndicators = [
      { nameCode: INDICATOR_NAME_CODES.DF_SLUC },
    ] as Indicator[];
    const strategies = strategyFactory.getStrategies(
      activeIndicators.map((i: Indicator) => i.nameCode),
    );
    const impactQuery = queryBuilder.buildQuery(strategies);

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

const expectedQuery =
  'SELECT DISTINCT ON (sr.id)\n' +
  '            sr.id as "sourcingRecordId",\n' +
  '            sr.tonnage,\n' +
  '            sr.year,\n' +
  '            slwithmaterialh3data.id as "sourcingLocationId",\n' +
  '            slwithmaterialh3data."materialH3DataId",\n' +
  '            LF, DF_SLUC\n' +
  '          FROM sourcing_records sr\n' +
  '          INNER JOIN (\n' +
  '            SELECT\n' +
  '              sourcing_location.id,\n' +
  '              "scenarioInterventionId",\n' +
  '              "interventionType",\n' +
  '              mth."h3DataId" as "materialH3DataId",\n' +
  '              sum_material_over_georegion(sourcing_location."geoRegionId", sourcing_location."adminRegionId", \'harvest\') as "harvest", sum_material_over_georegion(sourcing_location."geoRegionId", sourcing_location."adminRegionId", \'producer\') as "production", get_annual_commodity_weighted_impact_over_georegion(sourcing_location."geoRegionId", \'DF_SLUC\', sourcing_location."adminRegionId", \'producer\') as "DF_SLUC"\n' +
  '            FROM sourcing_location\n' +
  '            INNER JOIN material_to_h3 mth\n' +
  '              ON mth."materialId" = sourcing_location."materialId"\n' +
  '            WHERE "scenarioInterventionId" IS NULL\n' +
  '              AND "interventionType" IS NULL\n' +
  '              AND mth."type" = \'producer\'\n' +
  '          ) as slwithmaterialh3data\n' +
  '          ON sr."sourcingLocationId" = slwithmaterialh3data.id;\n' +
  '        ;';
