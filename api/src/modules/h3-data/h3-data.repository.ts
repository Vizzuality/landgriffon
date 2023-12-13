import {
  Brackets,
  DataSource,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import {
  H3Data,
  H3IndexValueData,
  LAYER_TYPES,
} from 'modules/h3-data/h3-data.entity';
import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { INDICATOR_NAME_CODES } from 'modules/indicators/indicator.entity';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';
import {
  GetActualVsScenarioImpactMapDto,
  GetImpactMapDto,
  GetScenarioVsScenarioImpactMapDto,
} from 'modules/h3-data/dto/get-impact-map.dto';
import {
  SCENARIO_INTERVENTION_STATUS,
  ScenarioIntervention,
} from 'modules/scenario-interventions/scenario-intervention.entity';
import {
  LOCATION_TYPES,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { ImpactMaterializedView } from 'modules/impact/views/impact.materialized-view.entity';

export enum IMPACT_MAP_TYPE {
  IMPACT_MAP = 'impact-map',
  ACTUAL_VS_SCENARIO = 'actual-vs-scenario',
  SCENARIO_VS_SCENARIO = 'scenario-vs-scenario',
}

/**
 * @note: Column aliases are marked as 'h' and 'v' so that DB returns data in the format the consumer needs to be
 * So we avoid doing transformations within the API and let the DB handle the heavy job
 */

// TODO: Check this thread for percentile calc: 3612905210000,https://stackoverflow.com/questions/39683330/percentile-calculation-with-a-window-function
@Injectable()
export class H3DataRepository extends Repository<H3Data> {
  constructor(private dataSource: DataSource) {
    super(H3Data, dataSource.createEntityManager());
  }

  logger: Logger = new Logger(H3DataRepository.name);

  static generateRandomTableName(): string {
    return (Math.random() + 1).toString(36).substring(2);
  }

  /** Retrieves data from dynamically generated H3 data
   *
   * @param h3ColumnName: Name of the column inside the dynamically generated table
   * @param h3TableName: Name of the dynamically generated table
   *
   */
  async getH3ByName(
    h3TableName: string,
    h3ColumnName: string,
  ): Promise<H3IndexValueData[]> {
    try {
      const result: H3IndexValueData[] | undefined = await this.dataSource
        .createQueryBuilder()
        .select('h3index', 'h')
        .addSelect(`"${h3ColumnName}"`, 'v')
        .from(`${h3TableName}`, 'h3')
        .getRawMany();

      if (!result) {
        throw new Error();
      }
      return result;
    } catch (err) {
      throw new NotFoundException(
        `H3 ${h3ColumnName} data in ${h3TableName} could not been found`,
      );
    }
  }

  /** Retrieves data from dynamically generated H3 data summing by H3 index for the given resolution
   * if no resolution is given, the h3 index of the max resolution available is served as found
   *
   * @param h3ColumnName: Name of the column inside the dynamically generated table
   * @param h3TableName: Name of the dynamically generated table
   * @param resolution: resolution of the h3 data
   *
   */
  async getSumH3ByNameAndResolution(
    h3TableName: string,
    h3ColumnName: string,
    resolution?: number,
  ): Promise<H3IndexValueData[]> {
    try {
      let selectStatement: string = 'h3index';
      if (resolution) {
        selectStatement = `h3_to_parent(h3index, ${resolution})`;
      }
      const query: SelectQueryBuilder<any> = this.dataSource
        .createQueryBuilder()
        .select(selectStatement, 'h')
        .addSelect(`sum("${h3ColumnName}")`, 'v')
        .from(`${h3TableName}`, 'h3')
        .groupBy('h');

      const result: H3IndexValueData[] | undefined = await query.getRawMany();

      if (result === undefined) {
        throw new Error();
      }
      return result;
    } catch (err) {
      throw new NotFoundException(
        `H3 ${h3ColumnName} data in ${h3TableName} could not been found`,
      );
    }
  }

  /** Retrieves single crop data by a given resolution
   *
   * Resolution validation done at route handler
   *
   * @param yearsRequestParams
   */

  async getAvailableYearsForContextualLayer(yearsRequestParams: {
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

  async getAvailableYearsForH3MaterialData(
    materialId: string,
    materialType: MATERIAL_TO_H3_TYPE,
  ): Promise<number[]> {
    const years: { year: number }[] = await this.createQueryBuilder('h3data')
      .select('year')
      .leftJoin('material_to_h3', 'mth', 'h3data.id = mth.h3DataId')
      .where('mth.materialId = :materialId', { materialId })
      .andWhere('mth.type = :materialType', { materialType })
      .orderBy('year', 'DESC')
      .getRawMany();
    return years.map((elem: { year: number }) => elem.year);
  }

  async getAvailableYearsForH3IndicatorData(
    indicatorId: string,
  ): Promise<number[]> {
    const years: { year: number }[] = await this.createQueryBuilder('h3data')
      .select('year')
      .leftJoin('indicator', 'i', 'h3data.indicatorId = i.id')
      .where('h3data.indicatorId = :indicatorId', { indicatorId })
      .orderBy('year', 'DESC')
      .getRawMany();
    return years.map((elem: { year: number }) => elem.year);
  }

  /**
   * Gets the closest Material H3 by absolute year, p.e. having and h3 for 2005 and 2010, the closest to 2006 will be 2005,
   * and the closest to 2008 will be 2010
   * @param materialId
   * @param year
   * @param type
   */
  async getMaterialH3ByTypeAndClosestYear(
    materialId: string,
    type: MATERIAL_TO_H3_TYPE,
    year: number,
  ): Promise<H3Data | undefined> {
    const queryBuilder: SelectQueryBuilder<H3Data> = this.dataSource
      .createQueryBuilder()
      .select('h3data.*')
      .from(H3Data, 'h3data')
      .leftJoin(
        'material_to_h3',
        'materialsToH3s',
        'materialsToH3s.h3DataId = h3data.id',
      )
      .where('materialsToH3s.materialId = :materialId', {
        materialId,
      })
      .andWhere('materialsToH3s.type = :type', { type })
      .orderBy(`ABS(h3data.year - ${year})`, 'ASC')
      .cache(1000)
      .limit(1);
    return queryBuilder.getRawOne();
  }

  /**
   * Gets the closest Indicator H3 by absolute year, p.e. having and h3 for 2005 and 2010, the closest to 2006 will be 2005,
   * and the closest to 2008 will be 2010
   * @param type
   * @param year
   */
  async getIndicatorH3ByTypeAndClosestYear(
    type: INDICATOR_NAME_CODES,
    year: number,
  ): Promise<H3Data | undefined> {
    const queryBuilder: SelectQueryBuilder<H3Data> = this.dataSource
      .createQueryBuilder()
      .select(' h3data.*')
      .from(H3Data, 'h3data')
      .leftJoin('indicator', 'indicator', 'h3data.indicatorId = indicator.id')
      .where('indicator.nameCode = :type', { type })
      .orderBy(`ABS(h3data.year - ${year})`, 'ASC')
      .limit(1);
    return queryBuilder.getRawOne();
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

    const queryBuilder: SelectQueryBuilder<H3Data> = this.dataSource
      .createQueryBuilder()
      .select(' h3data.*')
      .from(H3Data, 'h3data')
      .where(`h3data."contextualLayerId" = '${contextualLayerId}'`)
      .orderBy(`h3data.year`, 'DESC')
      .limit(1);
    return queryBuilder.getRawOne();
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
    const tmpTableName: string = H3DataRepository.generateRandomTableName();
    try {
      const query: string = this.dataSource
        .createQueryBuilder()
        .select(`h3_to_parent(h3index, ${resolution})`, 'h')
        .addSelect(`round(sum("${materialH3Data.h3columnName}"))`, 'v')
        .from(materialH3Data.h3tableName, 'h3table')
        .where(`"h3table"."${materialH3Data.h3columnName}" is not null`)
        .andWhere(`"${materialH3Data.h3columnName}" <> 0`)
        .groupBy('h')
        .getSql();

      await this.dataSource.query(
        `CREATE TEMPORARY TABLE "${tmpTableName}" AS (${query});`,
      );
      const materialMap: any = await this.dataSource.query(
        `SELECT *
         FROM "${tmpTableName}"
         WHERE "${tmpTableName}".v > 0;`,
      );
      const quantiles: number[] = await this.calculateQuantiles(tmpTableName);

      await this.dataSource.query(`DROP TABLE "${tmpTableName}"`);

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
              qb.where('sl.scenarioInterventionId IS NULL').orWhere(
                new Brackets((qbInterv: WhereExpressionBuilder) => {
                  qbInterv
                    .where('si.scenarioId = :scenarioId', {
                      scenarioId: dto.scenarioId,
                    })
                    .andWhere(`si.status = :status`, {
                      status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
                    });
                }),
              );
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
      IMPACT_MAP_TYPE.IMPACT_MAP,
      false,
      dto.materialIds,
      dto.originIds,
      dto.t1SupplierIds,
      dto.producerIds,
      dto.businessUnitIds,
      dto.locationTypes,
      baseQueryExtend,
      false,
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
            qb.where('sl.scenarioInterventionId IS NULL').orWhere(
              new Brackets((qbInterv: WhereExpressionBuilder) => {
                qbInterv
                  .where('si.scenarioId = :scenarioId', {
                    scenarioId: dto.comparedScenarioId,
                  })
                  .andWhere(`si.status = :status`, {
                    status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
                  });
              }),
            );
          }),
        );

      const sumDataWithScenario: string = 'sum(ir.value / ir.scaler)';

      // Sums values for actual data only
      const sumOnlyActualData: string =
        'sum(case when si."scenarioId" is null then ir.value else 0 end / ir.scaler)';

      // TODO "edge" case when sumDataWithoutScenario is 0, the result will always be 200%, pending to search for a more accurate formula by Elena

      baseQuery.addSelect(sumDataWithScenario, 'sum_compared_scenario');
      baseQuery.addSelect(sumOnlyActualData, 'sum_actual_data');
    };

    return await this.baseGetImpactMap(
      dto.indicatorId,
      dto.resolution,
      dto.year,
      IMPACT_MAP_TYPE.ACTUAL_VS_SCENARIO,
      dto.relative,
      dto.materialIds,
      dto.originIds,
      dto.t1SupplierIds,
      dto.producerIds,
      dto.businessUnitIds,
      dto.locationTypes,
      baseQueryExtend,
      true,
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
            qb.where('sl.scenarioInterventionId IS NULL').orWhere(
              new Brackets((qbInterv: WhereExpressionBuilder) => {
                qbInterv
                  .where('si.scenarioId IN (:...scenarioIds)', {
                    scenarioIds: [dto.baseScenarioId, dto.comparedScenarioId],
                  })
                  .andWhere(`si.status = :status`, {
                    status: SCENARIO_INTERVENTION_STATUS.ACTIVE,
                  });
              }),
            );
          }),
        );

      const sumDataWithBaseScenario: string = `sum(case when si."scenarioId" = '${dto.baseScenarioId}' or si."scenarioId" is null then ir.value else 0 end / ir.scaler)`;

      // Sums values of indicator records for the comparing scenario
      const sumDataWitComparedScenario: string = `sum(case when si."scenarioId" = '${dto.comparedScenarioId}' or si."scenarioId" is null then ir.value else 0 end / ir.scaler)`;

      // TODO "edge" case when sumDataWithoutScenario is 0, the result will always be 200%, pending to search for a more accurate formula by Elena

      baseQuery.addSelect(sumDataWithBaseScenario, 'sum_base_scenario');
      baseQuery.addSelect(sumDataWitComparedScenario, 'sum_compared_scenario');
    };

    return await this.baseGetImpactMap(
      dto.indicatorId,
      dto.resolution,
      dto.year,
      IMPACT_MAP_TYPE.SCENARIO_VS_SCENARIO,
      dto.relative,
      dto.materialIds,
      dto.originIds,
      dto.t1SupplierIds,
      dto.producerIds,
      dto.businessUnitIds,
      dto.locationTypes,
      baseQueryExtend,
      true,
    );
  }

  //TODO Pending refactoring of Quantiles temp table, and aggregation formulas
  private async baseGetImpactMap(
    indicatorId: string,
    resolution: number,
    year: number,
    mapType: IMPACT_MAP_TYPE,
    isRelative?: boolean,
    materialIds?: string[],
    originIds?: string[],
    t1SupplierIds?: string[],
    producerIds?: string[],
    businessUnitIds?: string[],
    locationTypes?: LOCATION_TYPES[],
    baseQueryExtend?: (baseQuery: SelectQueryBuilder<any>) => void,
    scenarioComparisonQuantiles?: boolean,
  ): Promise<{ impactMap: H3IndexValueData[]; quantiles: number[] }> {
    let baseMapQuery: SelectQueryBuilder<any> = this.baseMapQuery(
      indicatorId,
      year,
    );

    baseMapQuery = this.addFiltering(
      baseMapQuery,
      materialIds,
      t1SupplierIds,
      producerIds,
      originIds,
      businessUnitIds,
      locationTypes,
    );

    if (baseQueryExtend) {
      baseQueryExtend(baseMapQuery);
    }

    const aggregatedResultQuery: SelectQueryBuilder<any> =
      this.getAggregatedValuedByH3IndexAndResolution(
        baseMapQuery,
        resolution,
        mapType,
      );
    const finalQueryBuiler: SelectQueryBuilder<any> =
      this.dataSource.createQueryBuilder();
    if (mapType !== IMPACT_MAP_TYPE.IMPACT_MAP) {
      if (mapType === IMPACT_MAP_TYPE.ACTUAL_VS_SCENARIO) {
        if (isRelative) {
          finalQueryBuiler.select(
            '100 * (ABS(q.aggregated_scenario_data) - ABS(q.aggregated_actual_data)) / NULLIF(((ABS(q.aggregated_scenario_data) + ABS(q.aggregated_actual_data)) / 2), 0)',
            'v',
          );
        } else {
          finalQueryBuiler.select(
            'q.aggregated_scenario_data - q.aggregated_actual_data',
            'v',
          );
        }
      }
      if (mapType === IMPACT_MAP_TYPE.SCENARIO_VS_SCENARIO) {
        if (isRelative) {
          finalQueryBuiler.select(
            '100 * (ABS(q.aggregated_compared) - ABS(q.aggregated_base)) / NULLIF(((ABS(q.aggregated_compared) + ABS(q.aggregated_base)) / 2), 0)',
            'v',
          );
        } else {
          finalQueryBuiler.select(
            'q.aggregated_base - q.aggregated_compared',
            'v',
          );
        }
      }
      finalQueryBuiler.addSelect('q."h"', 'h');
      finalQueryBuiler.from('(' + aggregatedResultQuery.getSql() + ')', `q`);
    }

    const [queryString, params] = baseMapQuery.getQueryAndParameters();

    return this.executeQueryAndQuantiles(
      mapType === IMPACT_MAP_TYPE.IMPACT_MAP
        ? aggregatedResultQuery
        : finalQueryBuiler,
      params,
      scenarioComparisonQuantiles,
    );
  }

  private async executeQueryAndQuantiles(
    query: SelectQueryBuilder<any>,
    params: any[],
    scenarioComparisonQuantiles?: boolean,
  ): Promise<{ impactMap: H3IndexValueData[]; quantiles: number[] }> {
    try {
      const tmpTableName: string = H3DataRepository.generateRandomTableName();
      await this.dataSource.query(
        `CREATE TEMPORARY TABLE "${tmpTableName}" AS (${query.getSql()})`,
        params,
      );
      const impactMap: any = await this.dataSource.query(
        `SELECT * FROM "${tmpTableName}"
      WHERE ABS("${tmpTableName}".v) > 0;`,
      );
      const quantiles: number[] = await (scenarioComparisonQuantiles
        ? this.calculateScenarioComparisonQuantiles(tmpTableName)
        : this.calculateQuantiles(tmpTableName));
      await this.dataSource.query(`DROP TABLE "${tmpTableName}";`);

      this.logger.log('Impact Map generated');

      return { impactMap, quantiles };
    } catch (e: any) {
      this.logger.error(`Error querying Impact Map: ${e}`);
      // TODO: provisional guard to avoid a 500 in the consumer for when comparing scenario / actual values
      //       end up on a division by 0, which is now a not likely but uncovered case
      return {
        impactMap: [],
        quantiles: [0, 0, 0, 0, 0, 0, 0],
      };
    }
  }

  /**
   * @description Creates the "main" query to get the geoRegions, material H3ids and indicator record values
   *              to later be joined with the impact materialized view by these geoRegions and H3ids
   */
  private baseMapQuery(
    indicatorId: string,
    year: number,
  ): SelectQueryBuilder<any> {
    return (
      this.dataSource
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

  private addFiltering(
    subqueryBuilder: SelectQueryBuilder<any>,
    materialIds?: string[],
    t1SupplierIds?: string[],
    producerIds?: string[],
    originIds?: string[],
    businessUnitIds?: string[],
    locationTypes?: string[],
  ): SelectQueryBuilder<any> {
    if (materialIds) {
      subqueryBuilder.andWhere('sl.material IN (:...materialIds)', {
        materialIds,
      });
    }
    if (t1SupplierIds) {
      subqueryBuilder.andWhere('sl.t1SupplierId IN (:...t1SupplierIds)', {
        t1SupplierIds,
      });
    }
    if (producerIds) {
      subqueryBuilder.andWhere('sl.producerId IN (:...producerIds)', {
        producerIds,
      });
    }
    if (originIds) {
      subqueryBuilder.andWhere('sl.adminRegionId IN (:...originIds)', {
        originIds,
      });
    }
    if (businessUnitIds) {
      subqueryBuilder.andWhere('sl.businessUnitId IN (:...businessUnitIds)', {
        businessUnitIds,
      });
    }
    if (locationTypes) {
      subqueryBuilder.andWhere('sl.locationType IN (:...locationTypes)', {
        locationTypes,
      });
    }
    return subqueryBuilder;
  }

  /**
   * @description: Joins Impact Materialez view to get the production value for each hexagon for a same georegion and material
   *               Aggregation values are different depending on the type of map (ImpactMap, Actual vs Scenario, Scenario VS Scenario)
   */
  private getAggregatedValuedByH3IndexAndResolution(
    baseMapQuery: SelectQueryBuilder<any>,
    resolution: number,
    mapType: IMPACT_MAP_TYPE,
  ): SelectQueryBuilder<any> {
    const impactViewAggregationQueryBuilder: SelectQueryBuilder<ObjectLiteral> =
      this.dataSource
        .createQueryBuilder()
        .select(`h3_to_parent(impactview.h3index, ${resolution})`, `h`)
        .from('(' + baseMapQuery.getSql() + ')', 'reduced')
        .leftJoin(
          ImpactMaterializedView,
          'impactview',
          '(impactview."geoRegionId" = reduced."geoRegionId" AND impactview."h3DataId" = reduced."materialH3DataId")',
        )
        .groupBy('impactview.h3index');

    // If map type is Actual VS Scenario, sum up sum_actual_data and sum_compared_scenario from previous subquery
    if (mapType === IMPACT_MAP_TYPE.ACTUAL_VS_SCENARIO) {
      impactViewAggregationQueryBuilder.addSelect(
        'sum(impactview.value * reduced.sum_actual_data)',
        'aggregated_actual_data',
      );
      impactViewAggregationQueryBuilder.addSelect(
        'sum(impactview.value * reduced.sum_compared_scenario)',
        'aggregated_scenario_data',
      );
    }
    // If map type is Actual VS Scenario, sum up sum_base_scenario and sum_compared_scenario from previous subquery
    if (mapType === IMPACT_MAP_TYPE.SCENARIO_VS_SCENARIO) {
      impactViewAggregationQueryBuilder.addSelect(
        'sum(impactview.value * reduced.sum_base_scenario)',
        'aggregated_base',
      );
      impactViewAggregationQueryBuilder.addSelect(
        'sum(impactview.value * reduced.sum_compared_scenario)',
        'aggregated_compared',
      );
    }
    // If map type is Impact Map, sum up values from previous subquery
    if (mapType === IMPACT_MAP_TYPE.IMPACT_MAP) {
      impactViewAggregationQueryBuilder.addSelect(
        'round(sum(impactview.value * reduced.scaled_value)::numeric, 4)',
        'v',
      );
    }
    impactViewAggregationQueryBuilder.groupBy('h');

    return impactViewAggregationQueryBuilder;
  }

  /**
   * @debt: Refactor this to use queryBuilder. Even tho all values are previously validated, this isn't right, but
   * has been don't for the time being to unblock FE. Check with Data if calculus is accurate
   */
  private async calculateQuantiles(tmpTableName: string): Promise<number[]> {
    try {
      const resultArray: number[] = await this.dataSource.query(
        `select 0                                    as min,
                percentile_cont(0.1667) within group (order by v) as per16,
                percentile_cont(0.3337) within group (order by v) as per33,
                percentile_cont(0.50) within group (order by v)   as per50,
                percentile_cont(0.6667) within group (order by v) as per66,
                percentile_cont(0.8337) within group (order by v) as per83,
                percentile_cont(1) within group (order by v)      as max
         from "${tmpTableName}"
         where v>0
         `,
      );
      return Object.values(resultArray[0]);
    } catch (err) {
      this.logger.error(err);
      throw new Error(`Quantiles could not been calculated`);
    }
  }

  /**
   * This quantile calculation is meant to be used only for comparison maps
   */
  private async calculateScenarioComparisonQuantiles(
    tmpTableName: string,
  ): Promise<number[]> {
    try {
      // due to the inner workings of the pg driver and the way it parses different number types
      // this is explicitly cast to a double precision float, so the returning type is a JS number
      const resultArrayMax: any[] = await this.dataSource.query(
        `select
         CAST(max(v) AS DOUBLE PRECISION) max_val,
         CAST(percentile_cont(0.66667) within group (order by v) AS DOUBLE PRECISION) perc66max,
         CAST(percentile_cont(0.33333) within group (order by v) AS DOUBLE PRECISION) perc33max
         from "${tmpTableName}"
         where v > 0;
         `,
      );
      const resultArrayMin: any[] = await this.dataSource.query(
        `select
         CAST(min(v) AS DOUBLE PRECISION) min_val,
         CAST(percentile_cont(0.33333) within group (order by v) AS DOUBLE PRECISION) perc33min,
         CAST(percentile_cont(0.66667) within group (order by v) AS DOUBLE PRECISION) perc66min
         from "${tmpTableName}"
         where v < 0;
         `,
      );

      return [
        resultArrayMin[0].min_val || 0,
        resultArrayMin[0].perc33min || 0,
        resultArrayMin[0].perc66min || 0,
        0,
        resultArrayMax[0].perc33max || 0,
        resultArrayMax[0].perc66max || 0,
        resultArrayMax[0].max_val || 0,
      ];
    } catch (err) {
      this.logger.error(err);
      throw new Error(`Comparison Quantiles could not be calculated`);
    }
  }
}
