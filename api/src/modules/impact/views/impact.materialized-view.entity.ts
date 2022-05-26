/**
 * @description: Materialized View to perform queries to retrieve Impact Maps
 *               Should trigger a refresh AfterInsert and AfterUpdate on Indicator Records
 *
 * @note: Parameter binding is not supported by TypeORM so
 */
import { Index, ViewColumn, ViewEntity } from 'typeorm';
export const IMPACT_VIEW_NAME: string = 'impact_materialized_view';

@ViewEntity({
  expression: `SELECT
    reduced."geoRegionId" as "geoRegionId",
    reduced."h3DataId" as "h3DataId",
    h3data."h3index" as "h3index",
    h3data.value as value
FROM (
    SELECT DISTINCT
        sl."geoRegionId" as "geoRegionId",
        ir."materialH3DataId" as "h3DataId"
    FROM sourcing_location sl
    LEFT JOIN sourcing_records sr ON sr."sourcingLocationId" = sl."id"
    LEFT JOIN indicator_record ir ON ir."sourcingRecordId" = sr."id"
) reduced,
LATERAL (
    SELECT
        h3index,
        value
    FROM get_h3_data_over_georegion(reduced."geoRegionId", reduced."h3DataId")
) h3data;`,
  materialized: true,
  name: IMPACT_VIEW_NAME,
  synchronize: false,
})
@Index(['h3index', 'value', 'geoRegionId', 'h3DataId'])
export class ImpactMaterializedView {
  @ViewColumn()
  h3index!: string;

  @ViewColumn()
  h3DataId: string;

  @ViewColumn()
  geoRegionId: string;

  @ViewColumn()
  value: number;
}
