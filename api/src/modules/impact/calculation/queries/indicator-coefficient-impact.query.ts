import { TinyTypeOf } from 'tiny-types';
import { DataSource } from 'typeorm';
import { MaterialId } from './production-and-harvest.query';
import { ImpactRawDataComputingError } from './annual-commodity-weighted-impact.query';

export class IndicatorId extends TinyTypeOf<string>() {}

export class AdminRegionId extends TinyTypeOf<string>() {}

interface IndicatorCoefficientImpactQueryParams {
  indicatorId: IndicatorId;
  materialId: MaterialId;
  adminRegionId: AdminRegionId;
}

export class IndicatorCoefficientImpactValue extends TinyTypeOf<number>() {}

export class IndicatorCoefficientImpactQuery {
  constructor(private readonly dataSource: DataSource) {}

  async getIndicatorCoefficientImpact(
    params: IndicatorCoefficientImpactQueryParams,
  ): Promise<IndicatorCoefficientImpactValue> {
    const indicatorId = params.indicatorId.value;
    const adminRegionId = params.adminRegionId.value;
    const materialId = params.materialId.value;
    const query: string = `
      WITH RECURSIVE
        region_tree AS (SELECT id, "parentId", 0 AS level
                        FROM admin_region
                        WHERE id = $2

                        UNION ALL

                        SELECT ar.id, ar."parentId", rt.level + 1
                        FROM admin_region ar
                               INNER JOIN region_tree rt ON ar.id = rt."parentId"),
        candidate_values AS (SELECT ic."value" AS candidate_value, rt.level
                             FROM region_tree rt
                                    JOIN indicator_coefficient ic ON ic."adminRegionId" = rt.id
                             WHERE ic."materialId" = $3
                               AND ic."indicatorId" = $1
                               AND ic."value" IS NOT NULL

                             UNION ALL

                             SELECT ic."value" AS candidate_value, 9999 AS level
                             FROM indicator_coefficient ic
                             WHERE ic."adminRegionId" IS NULL
                               AND ic."materialId" = $3
                               AND ic."indicatorId" = $1
                               AND ic."value" IS NOT NULL)
      SELECT candidate_value AS value
      FROM candidate_values
      ORDER BY level ASC
        LIMIT 1;
    `;
    const res: { value: number }[] = await this.dataSource.query(query, [
      indicatorId,
      adminRegionId,
      materialId,
    ]);

    if (!res.length) {
      throw new ImpactRawDataComputingError(
        `No indicator coefficient impact found for indicator ${indicatorId}, material ${materialId} and admin region ${adminRegionId}`,
      );
    }
    return new IndicatorCoefficientImpactValue(res[0].value);
  }
}
