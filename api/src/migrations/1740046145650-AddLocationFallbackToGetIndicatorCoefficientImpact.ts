import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationFallbackToGetIndicatorCoefficientImpact1740046145650
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION public.get_indicator_coefficient_impact(
          name_code text,
          admin_region_id uuid,
          material_id uuid
      )
      RETURNS double precision
      LANGUAGE plpgsql
      AS $function$
      DECLARE
        indicator_id uuid;
        value float;
      BEGIN

        SELECT "id" INTO indicator_id
        FROM "indicator"
        WHERE "nameCode" = name_code;


        WITH RECURSIVE region_tree AS (
          SELECT id, "parentId", 0 AS level
          FROM admin_region
          WHERE id = admin_region_id

          UNION ALL

          SELECT ar.id, ar."parentId", rt.level + 1
          FROM admin_region ar
          INNER JOIN region_tree rt ON ar.id = rt."parentId"
        ),
        candidate_values AS (
          SELECT ic."value" AS candidate_value, rt.level
          FROM region_tree rt
          JOIN indicator_coefficient ic ON ic."adminRegionId" = rt.id
          WHERE ic."materialId" = material_id
            AND ic."indicatorId" = indicator_id
            AND ic."value" IS NOT NULL

          UNION ALL


          SELECT ic."value" AS candidate_value, 9999 AS level
          FROM indicator_coefficient ic
          WHERE ic."adminRegionId" IS NULL
            AND ic."materialId" = material_id
            AND ic."indicatorId" = indicator_id
            AND ic."value" IS NOT NULL
        )
        SELECT candidate_value INTO value
        FROM candidate_values
        ORDER BY level ASC
        LIMIT 1;

        RETURN value;
      END;
      $function$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION public.get_indicator_coefficient_impact(
          name_code text,
          admin_region_id uuid,
          material_id uuid
      )
      RETURNS double precision
      LANGUAGE plpgsql
      AS $function$
      DECLARE
        indicator_id uuid;
        value float;
      BEGIN

        SELECT "id" INTO indicator_id FROM "indicator"
        WHERE "nameCode" = name_code;

        EXECUTE format(
          'SELECT
              COALESCE (
                  (
                  SELECT ic."value"
                  FROM "indicator_coefficient" ic
                  WHERE ic."adminRegionId" = $1
                  AND ic."materialId" = $2
                  AND ic."indicatorId" = $3
                  AND ic."value" IS NOT NULL
                  ),
                  (
                  SELECT ic."value"
                  FROM "indicator_coefficient" ic
                  WHERE ic."adminRegionId" IS NULL
                  AND ic."materialId" = $2
                  AND ic."indicatorId" = $3
                  AND ic."value" IS NOT NULL
                  )
              ) AS value;'
        )
        USING admin_region_id, material_id, indicator_id
        INTO value;
        RETURN value;
      END;
      $function$;
    `);
  }
}
