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

/**
 * Retrieves the indicator coefficient impact value for a given indicator, material, and administrative region.
 *
 * The logic is as follows:
 * Given an `adminRegion`, which is the most precise administrative region detected for the location in question,
 * a recursive query is performed to obtain the value.
 *
 * If the value is not found for the most precise `adminRegion`, it searches in the parent region, and so on,
 * up to the highest level of the hierarchy.
 *
 * If no value is found, it falls back to the `adminRegion` with a null value, which represents the global value.
 *
 * @param {IndicatorCoefficientImpactQueryParams} params - The parameters for the query.
 * @param {IndicatorId} params.indicatorId - The ID of the indicator.
 * @param {MaterialId} params.materialId - The ID of the material.
 * @param {AdminRegionId} params.adminRegionId - The ID of the administrative region.
 * @returns {Promise<IndicatorCoefficientImpactValue>} - The indicator coefficient impact value.
 * @throws {ImpactRawDataComputingError} - If no indicator coefficient impact value is found.
 */

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
