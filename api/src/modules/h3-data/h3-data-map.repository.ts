import {
  Brackets,
  EntityRepository,
  getManager,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import {
  H3Data,
  H3IndexValueData,
  LAYER_TYPES,
} from 'modules/h3-data/h3-data.entity';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  LOCATION_TYPES_PARAMS,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { ImpactMaterializedView } from 'modules/impact/views/impact.materialized-view.entity';
import { ScenarioIntervention } from 'modules/scenario-interventions/scenario-intervention.entity';
import {
  GetActualVsScenarioImpactMapDto,
  GetImpactMapDto,
  GetScenarioVsScenarioImpactMapDto,
} from 'modules/h3-data/dto/get-impact-map.dto';

/**
 * @note: Column aliases are marked as 'h' and 'v' so that DB returns data in the format the consumer needs to be
 * So we avoid doing transformations within the API and let the DB handle the heavy job
 */

// TODO: Check this thread for percentile calc: 3612905210000,https://stackoverflow.com/questions/39683330/percentile-calculation-with-a-window-function
@EntityRepository(H3Data)
export class H3DataMapRepository extends Repository<H3Data> {
  logger: Logger = new Logger(H3DataMapRepository.name);

  static generateRandomTableName(): string {
    return (Math.random() + 1).toString(36).substring(2);
  }

  async getYears(yearsRequestParams: {
    layerType: LAYER_TYPES;
    h3DataIds?: string[] | null;
    indicatorId?: string;
  }): Promise<number[]> {
    const queryBuilder: SelectQueryBuilder<H3Data> = this.createQueryBuilder(
      'h3data',
    )
      .select('year')
      .distinct(true)
      .where('year is not null')
      .orderBy('year', 'ASC');

    // If a indicatorId is provided, filter results by it
    if (yearsRequestParams.indicatorId) {
      queryBuilder.where('"indicatorId" = :indicatorId', {
        indicatorId: yearsRequestParams.indicatorId,
      });
    }

    if (
      yearsRequestParams.h3DataIds &&
      yearsRequestParams.h3DataIds.length > 0
    ) {
      queryBuilder.where(`h3data.id  IN (:...h3DataIds)`, {
        h3DataIds: yearsRequestParams.h3DataIds,
      });
    }

    // Filter by data type
    if (yearsRequestParams.layerType !== LAYER_TYPES.RISK) {
      queryBuilder.andWhere(`"indicatorId" is null`);
    } else {
      queryBuilder.andWhere(`"indicatorId" is not null`);
    }
    const availableYears: any[] = await queryBuilder.getRawMany();
    return availableYears.map((elem: { year: number }) => elem.year);
  }

  /** Retrieves single crop data by a given resolution
   *
   * @param materialH3Data: H3 Data table and column name for a specific material
   * @param resolution: An integer between 1 (min resolution) and 6 (max resolution).
   * Resolution validation done at route handler
   *
   */
  async getMaterialMapByResolution(
    materialH3Data: H3Data,
    resolution: number,
  ): Promise<{ materialMap: H3IndexValueData[]; quantiles: number[] }> {
    const tmpTableName: string = H3DataMapRepository.generateRandomTableName();
    try {
      const query: string = getManager()
        .createQueryBuilder()
        .select(`h3_to_parent(h3index, ${resolution})`, 'h')
        .addSelect(`round(sum("${materialH3Data.h3columnName}"))`, 'v')
        .from(materialH3Data.h3tableName, 'h3table')
        .where(`"h3table"."${materialH3Data.h3columnName}" is not null`)
        .andWhere(`"${materialH3Data.h3columnName}" <> 0`)
        .groupBy('h')
        .getSql();

      await getManager().query(
        `CREATE TEMPORARY TABLE "${tmpTableName}" AS (${query});`,
      );
      const materialMap: any = await getManager().query(
        `SELECT *
         FROM "${tmpTableName}"
         WHERE "${tmpTableName}".v > 0;`,
      );
      const quantiles: number[] = await this.calculateQuantiles(tmpTableName);

      await getManager().query(`DROP TABLE "${tmpTableName}"`);

      this.logger.log('Material Map generated');
      return { materialMap, quantiles };
    } catch (err) {
      this.logger.error(err);
      throw new ServiceUnavailableException(
        'Material Map could not been generated',
      );
    }
  }

  async getImpactMap(
    dto: GetImpactMapDto,
  ): Promise<{ impactMap: H3IndexValueData[]; quantiles: number[] }> {
    const baseQueryExtend = (baseQuery: SelectQueryBuilder<any>): void => {
      //Having a scenarioId present as an argument, will change the query to include
      // *all* indicator records of the interventions pertaining to that scenario (both
      // the CANCELLED and REPLACING records)
      if (dto.scenarioId) {
        baseQuery
          .leftJoin(
            ScenarioIntervention,
            'si',
            'si.id = sl.scenarioInterventionId',
          )
          .andWhere(
            new Brackets((qb: WhereExpressionBuilder) => {
              qb.where('sl.scenarioInterventionId IS NULL');
              qb.orWhere('si.scenarioId = :scenarioId', {
                scenarioId: dto.scenarioId,
              });
            }),
          );
      } else {
        baseQuery.andWhere('sl.scenarioInterventionId IS NULL');
      }

      baseQuery.addSelect('sum(ir.value/ir.scaler)', 'scaled_value');
    };

    return await this.baseGetImpactMap(
      dto.indicatorId,
      dto.resolution,
      dto.year,
      dto.materialIds,
      dto.originIds,
      dto.supplierIds,
      dto.locationTypes,
      baseQueryExtend,
    );
  }

  async getActualVsScenarioImpactMap(
    dto: GetActualVsScenarioImpactMapDto,
  ): Promise<{ impactMap: H3IndexValueData[]; quantiles: number[] }> {
    const baseQueryExtend = (baseQuery: SelectQueryBuilder<any>): void => {
      //Add selection criteria to also select both comparedScenario in the select statement
      baseQuery
        .leftJoin(
          ScenarioIntervention,
          'si',
          'si.id = sl.scenarioInterventionId',
        )
        .andWhere(
          new Brackets((qb: WhereExpressionBuilder) => {
            qb.where('sl.scenarioInterventionId IS NULL');
            qb.orWhere('si.scenarioId = :scenarioId', {
              scenarioId: dto.comparedScenarioId,
            });
          }),
        );

      // Add the aggregation formula
      // Absolute: ((compared - actual)  / scaler
      // Relative: 100 * ((compared - actual) / ((compared + actual) / 2 ) / scaler
      const sumDataWithScenario: string = 'sum(ir.value)';
      const sumDataWithoutScenario: string =
        'sum(case when si."scenarioId" is null then ir.value else 0 end)';
      let aggregateExpression: string;

      if (dto.relative) {
        // TODO "edge" case when sumDataWithoutScenario is 0, the result will always be 200%, pending to search for a more accurate formula by Elena
        aggregateExpression = `100 * ( ${sumDataWithScenario} - ${sumDataWithoutScenario}) / ( ( ${sumDataWithScenario} + ${sumDataWithoutScenario} ) / 2 ) / ir.scaler `;
      } else {
        aggregateExpression = `( ${sumDataWithScenario} - ${sumDataWithoutScenario} ) / ir.scaler `;
      }

      baseQuery.addSelect(aggregateExpression, 'scaled_value');
    };

    return await this.baseGetImpactMap(
      dto.indicatorId,
      dto.resolution,
      dto.year,
      dto.materialIds,
      dto.originIds,
      dto.supplierIds,
      dto.locationTypes,
      baseQueryExtend,
    );
  }

  async getScenarioVsScenarioImpactMap(
    dto: GetScenarioVsScenarioImpactMapDto,
  ): Promise<{ impactMap: H3IndexValueData[]; quantiles: number[] }> {
    const baseQueryExtend = (baseQuery: SelectQueryBuilder<any>): void => {
      //Add selection criteria to also select both baseScenario and comparedScenario in the select statement
      baseQuery
        .leftJoin(
          ScenarioIntervention,
          'si',
          'si.id = sl.scenarioInterventionId',
        )
        .andWhere(
          new Brackets((qb: WhereExpressionBuilder) => {
            qb.where('sl.scenarioInterventionId IS NULL');
            qb.orWhere('si.scenarioId IN (:...scenarioIds)', {
              scenarioIds: [dto.baseScenarioId, dto.comparedScenarioId],
            });
          }),
        );

      // Add the aggregation formula
      // Absolute: ((compared - base)  / scaler
      // Relative: 100 * ((compared - base) / ((compared + base) / 2 ) / scaler
      const sumDataWithBaseScenario: string = `sum(case when si."scenarioId" = '${dto.baseScenarioId}' or si."scenarioId" is null then ir.value else 0 end)`;
      const sumDataWitComparedScenario: string = `sum(case when si."scenarioId" = '${dto.comparedScenarioId}' or si."scenarioId" is null then ir.value else 0 end)`;
      let aggregateExpression: string;

      if (dto.relative) {
        // TODO "edge" case when sumDataWithoutScenario is 0, the result will always be 200%, pending to search for a more accurate formula by Elena
        aggregateExpression = `100 * (${sumDataWitComparedScenario} - ${sumDataWithBaseScenario}) / ( ( ${sumDataWitComparedScenario} + ${sumDataWithBaseScenario} ) / 2 ) / ir.scaler `;
      } else {
        aggregateExpression = `( ${sumDataWitComparedScenario} - ${sumDataWithBaseScenario} ) / ir.scaler `;
      }

      baseQuery.addSelect(aggregateExpression, 'scaled_value');
    };

    return await this.baseGetImpactMap(
      dto.indicatorId,
      dto.resolution,
      dto.year,
      dto.materialIds,
      dto.originIds,
      dto.supplierIds,
      dto.locationTypes,
      baseQueryExtend,
    );
  }

  /**
   * This functions is used as a basis for all Impact functions. It builds a query with different levels of nesting
   * to generate the map values. The base query will be "extended" by the incoming baseQueryExtend parameter, which is
   * a function that will receive baseMapQuery so that the appropriate aggregation formulas and further selection criteria
   * can be added.
   * ATTENTION: This baseQueryExtend function add a select statement with a an aggregation formula and alias "scaled_value"
   * @param indicatorId Indicator data of a Indicator
   * @param resolution Integer value that represent the resolution which the h3 response should be calculated
   * @param year
   * @param materialIds
   * @param originIds
   * @param supplierIds
   * @param locationTypes
   * @param baseQueryExtend
   */
  //TODO Pending refactoring of Quantiles temp table, and aggregation formulas
  private async baseGetImpactMap(
    indicatorId: string,
    resolution: number,
    year: number,
    materialIds?: string[],
    originIds?: string[],
    supplierIds?: string[],
    locationTypes?: LOCATION_TYPES_PARAMS[],
    baseQueryExtend?: (baseQuery: SelectQueryBuilder<any>) => void,
  ): Promise<{ impactMap: H3IndexValueData[]; quantiles: number[] }> {
    let baseMapQuery: SelectQueryBuilder<any> = this.generateBaseMapSubQuery(
      indicatorId,
      year,
    );

    baseMapQuery = this.addSmartFilters(
      baseMapQuery,
      materialIds,
      supplierIds,
      originIds,
      locationTypes,
    );

    if (baseQueryExtend) {
      baseQueryExtend(baseMapQuery);
    }

    const aggregatedResultQuery: SelectQueryBuilder<any> =
      this.generateAggregatedQuery(baseMapQuery);

    const withDynamicResolution: SelectQueryBuilder<any> =
      this.generateWithDynamicResolutionQuery(
        aggregatedResultQuery,
        resolution,
      );

    // NOTE the query structure is like this: withDynamicResolution FROM (aggregatedResult FROM (baseMapQuery))
    // the base query, which has the most parameters, is nested as a subquery 2 levels
    // the statement below is made with the assumption that none of the queries above baseMapQuery have any query params
    const [queryString, params] = baseMapQuery.getQueryAndParameters();

    return this.executeQueryAndQuantiles(withDynamicResolution, params);
  }

  private async executeQueryAndQuantiles(
    query: SelectQueryBuilder<any>,
    params: any[],
  ): Promise<{ impactMap: H3IndexValueData[]; quantiles: number[] }> {
    const tmpTableName: string = H3DataMapRepository.generateRandomTableName();
    await getManager().query(
      `CREATE TEMPORARY TABLE "${tmpTableName}" AS (${query.getSql()})`,
      params,
    );
    const impactMap: any = await getManager().query(
      `SELECT * FROM "${tmpTableName}"
      WHERE ABS("${tmpTableName}".v) > 0;`,
    );
    const quantiles: number[] = await this.calculateQuantiles(tmpTableName);
    await getManager().query(`DROP TABLE "${tmpTableName}";`);

    this.logger.log('Impact Map generated');

    return { impactMap, quantiles };
  }

  private generateBaseMapSubQuery(
    indicatorId: string,
    year: number,
  ): SelectQueryBuilder<any> {
    return (
      getManager()
        .createQueryBuilder()
        .select('sl.geoRegionId', 'geoRegionId')
        .addSelect('ir.materialH3DataId', 'materialH3DataId')
        // ATTENTION: a suitable aggregation formula must be added via baseQueryExtend received by baseGetImpactMap
        .from(SourcingLocation, 'sl')
        .leftJoin(SourcingRecord, 'sr', 'sl.id = sr.sourcingLocationId')
        .leftJoin(IndicatorRecord, 'ir', 'sr.id = ir.sourcingRecordId')
        .where('ABS(ir.value) > 0')
        .andWhere('ir.scaler >= 1')
        .andWhere(`ir.indicatorId = '${indicatorId}'`)
        .andWhere(`sr.year = ${year}`)
        .groupBy('sl.geoRegionId')
        .addGroupBy('ir.materialH3DataId')
        .addGroupBy('ir.scaler')
    );
  }

  private addSmartFilters(
    subqueryBuilder: SelectQueryBuilder<any>,
    materialIds?: string[],
    supplierIds?: string[],
    originIds?: string[],
    locationTypes?: string[],
  ): SelectQueryBuilder<any> {
    if (materialIds) {
      subqueryBuilder.andWhere('sl.material IN (:...materialIds)', {
        materialIds,
      });
    }
    if (supplierIds) {
      subqueryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('sl.t1SupplierId IN (:...supplierIds)', {
            supplierIds,
          }).orWhere('sl.producerId IN (:...supplierIds)', { supplierIds });
        }),
      );
    }
    if (originIds) {
      subqueryBuilder.andWhere('sl.adminRegionId IN (:...originIds)', {
        originIds,
      });
    }
    if (locationTypes) {
      subqueryBuilder.andWhere('sl.locationType IN (:...locationTypes)', {
        locationTypes,
      });
    }
    return subqueryBuilder;
  }

  private generateAggregatedQuery(
    baseMapQuery: SelectQueryBuilder<any>,
  ): SelectQueryBuilder<any> {
    return getManager()
      .createQueryBuilder()
      .select(`impactview.h3index`, `h3index`)
      .addSelect(`sum(impactview.value * reduced.scaled_value)`, `sum`)
      .from('(' + baseMapQuery.getSql() + ')', 'reduced')
      .leftJoin(
        ImpactMaterializedView,
        'impactview',
        '(impactview."geoRegionId" = reduced."geoRegionId" AND impactview."h3DataId" = reduced."materialH3DataId")',
      )
      .groupBy('impactview.h3index');
  }

  private generateWithDynamicResolutionQuery(
    aggregatedResultQuery: SelectQueryBuilder<any>,
    resolution: number,
  ): SelectQueryBuilder<any> {
    return getManager()
      .createQueryBuilder()
      .addSelect(`h3_to_parent(q.h3index, ${resolution})`, `h`)
      .addSelect(`round(sum(sum)::numeric, 2)`, `v`)
      .from(`( ${aggregatedResultQuery.getSql()} )`, `q`)
      .groupBy('h');
  }

  /**
   * Gets the closest ContextualLayer H3 by absolute year, p.e. having and h3 for 2005 and 2010, the closest to 2006 will be 2005,
   * and the closest to 2008 will be 2010
   * @param contextualLayerId
   * @param year
   */
  async getContextualLayerH3DataByClosestYear(
    contextualLayerId: string,
    year?: number,
  ): Promise<H3Data | undefined> {
    //TODO for the sake of simplicity in regards to the incoming Demo on July, this function
    // for now, just returns the first most recent result that it finds, since there won't be multiple year data yet

    const queryBuilder: SelectQueryBuilder<H3Data> = getManager()
      .createQueryBuilder()
      .select(' h3data.*')
      .from(H3Data, 'h3data')
      .where(`h3data."contextualLayerId" = '${contextualLayerId}'`)
      .orderBy(`h3data.year`, 'DESC')
      .limit(1);
    return queryBuilder.getRawOne();
  }

  /**
   * @debt: Refactor this to use queryBuilder. Even tho all values are previously validated, this isn't right, but
   * has been don for the time being to unblock FE. Check with Data if calculus is accurate
   */
  private async calculateQuantiles(tmpTableName: string): Promise<number[]> {
    try {
      const resultArray: any[] = await getManager().query(
        `select greatest(abs(max(v)),abs(min(v))) max_val
            from "${tmpTableName}"
         `,
      );
      const maxVal: number = resultArray[0].max_val;
      return [
        +maxVal,
        0.66 * maxVal,
        0.33 * maxVal,
        0,
        -0.33 * maxVal,
        -0.66 * maxVal,
        -maxVal,
      ];
    } catch (err) {
      this.logger.error(err);
      throw new Error(`Quantiles could not been calculated`);
    }
  }
}
