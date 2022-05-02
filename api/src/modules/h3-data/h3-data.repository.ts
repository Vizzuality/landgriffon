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
import {
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Indicator } from 'modules/indicators/indicator.entity';
import {
  LOCATION_TYPES_PARAMS,
  SourcingLocation,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';

/**
 * @note: Column aliases are marked as 'h' and 'v' so that DB returns data in the format the consumer needs to be
 * So we avoid doing transformations within the API and let the DB handle the heavy job
 */

// TODO: Check this thread for percentile calc: 3612905210000,https://stackoverflow.com/questions/39683330/percentile-calculation-with-a-window-function
@EntityRepository(H3Data)
export class H3DataRepository extends Repository<H3Data> {
  logger: Logger = new Logger(H3DataRepository.name);

  private static generateRandomTableName(): string {
    return (Math.random() + 1).toString(36).substring(2);
  }

  /** Retrieves data from dynamically generated H3 data
   *
   * @param h3ColumnName: Name of the column inside the dynamically generated table
   * @param h3TableName: Name of the dynamically generated table
   *
   */
  async findH3ByName(
    h3TableName: string,
    h3ColumnName: string,
  ): Promise<H3IndexValueData[]> {
    try {
      const result: H3IndexValueData[] | undefined = await getManager()
        .createQueryBuilder()
        .select('h3index', 'h')
        .addSelect(`${h3ColumnName}`, 'v')
        .from(`${h3TableName}`, 'h3')
        .getRawOne();

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
      const query: string = getManager()
        .createQueryBuilder()
        .select(`h3_to_parent(h3index, ${resolution})`, 'h')
        .addSelect(`sum("${materialH3Data.h3columnName}")`, 'v')
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
         FROM "${tmpTableName}";`,
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

  /**
   * @param indicatorH3Data H3 format data of a Indicator
   * @param materialH3Data  H3 format data of a material
   * @param calculusFactor Integer value to perform calculus. Represents the factor
   * @param resolution Integer value that represent the resolution which the h3 response should be calculated
   */
  async getWaterRiskMapByResolution(
    indicatorH3Data: H3Data,
    materialH3Data: H3Data,
    calculusFactor: number,
    resolution: number,
  ): Promise<{ riskMap: H3IndexValueData[]; quantiles: number[] }> {
    const tmpTableName: string = H3DataRepository.generateRandomTableName();
    const query: string = getManager()
      .createQueryBuilder()
      .select(`h3_to_parent(risk_calc.h3index, ${resolution})`, 'h')
      .addSelect(`sum(risk_calc.water_risk)`, 'v')
      .from((subQuery: SelectQueryBuilder<any>) => {
        return subQuery
          .select(`indicatorh3.h3index `)
          .addSelect(
            `indicatorh3."${indicatorH3Data.h3columnName}" * ${calculusFactor} / sum(materialh3."${materialH3Data.h3columnName}") over() water_risk`,
          )
          .from(materialH3Data.h3tableName, 'materialh3')
          .innerJoin(
            indicatorH3Data.h3tableName,
            'indicatorh3',
            'indicatorh3.h3index = materialh3.h3index',
          )
          .where(`materialh3."${materialH3Data.h3columnName}" is not null`)
          .andWhere(
            `indicatorh3."${indicatorH3Data.h3columnName}" is not null`,
          );
      }, 'risk_calc')
      .groupBy('h')
      .getSql();

    await getManager().query(
      `CREATE TEMPORARY TABLE "${tmpTableName}" AS (${query});`,
    );
    const riskMap: any = await getManager().query(
      `SELECT *
       FROM "${tmpTableName}";`,
    );
    const quantiles: number[] = await this.calculateQuantiles(tmpTableName);
    await getManager().query(`DROP TABLE "${tmpTableName}"`);
    this.logger.log('Water Risk Map generated');

    return { riskMap, quantiles };
  }

  /**
   * @param indicator Indicator data of a Indicator
   * @param resolution Integer value that represent the resolution which the h3 response should be calculated
   * @param groupBy
   * @param year
   * @param materialIds
   */
  async getImpactMap(
    indicator: Indicator,
    resolution: number,
    year: number,
    materialIds?: string[],
    originIds?: string[],
    supplierIds?: string[],
    locationType?: LOCATION_TYPES_PARAMS[],
  ): Promise<{ riskMap: H3IndexValueData[]; quantiles: number[] }> {
    const selectQueryBuilder: SelectQueryBuilder<any> = getManager()
      .createQueryBuilder()
      .select(`h3_to_parent((h3data.h3index), ${resolution})`, `h`)
      .addSelect(`sum(h3data.value)`, `v`)
      .from(SourcingLocation, 'sl')
      .innerJoin(SourcingRecord, 'sr', 'sl.id = sr.sourcingLocationId')
      .innerJoin(IndicatorRecord, 'ir', 'sr.id = ir.sourcingRecordId')
      .innerJoin('material_to_h3', 'mth', 'mth.materialId = sl.materialId')
      .where('sr.year = :year', { year })
      .andWhere('sl."scenarioInterventionId" IS NULL')
      .andWhere('sl."interventionType" IS NULL')
      .andWhere('ir."indicatorId" = :indicatorId', {
        indicatorId: indicator.id,
      });

    if (materialIds) {
      selectQueryBuilder.andWhere('sl.material IN (:...materialIds)', {
        materialIds,
      });
    }

    if (supplierIds) {
      selectQueryBuilder.andWhere(
        new Brackets((qb: WhereExpressionBuilder) => {
          qb.where('sl.t1SupplierId IN (:...supplierIds)', {
            supplierIds,
          }).orWhere('sl.producerId IN (:...supplierIds)', { supplierIds });
        }),
      );
    }
    if (originIds) {
      selectQueryBuilder.andWhere('sl.adminRegionId IN (:...originIds)', {
        originIds,
      });
    }
    if (locationType) {
      const sourcingLocationTypes: string[] = locationType.map(
        (el: LOCATION_TYPES_PARAMS) => {
          return el.replace(/-/g, ' ');
        },
      );
      selectQueryBuilder.andWhere('sl.locationType IN (:...sourcingLocationTypes)', {
        sourcingLocationTypes,
      });
    }

    selectQueryBuilder.groupBy('h');

    // This query has everything except the LATERAL join not supported by typeorm, so we are getting the raw SQL string to manually insert the LATERAL string into it
    const [selectQuery, selectQueryParams]: [string, any[]] =
      selectQueryBuilder.getQueryAndParameters();

    // Finding the position (index of a string) to insert LATERAL string - right before the first WHERE caluse
    const positionToInsertLateral: number = selectQuery.indexOf('WHERE');

    // The LATERAL SQL string that needs to be added to query
    const sqlStringForLateral: string = `, LATERAL(SELECT h3index, ir.value/ir.scaler * value as value FROM get_h3_data_over_georegion(sl."geoRegionId", mth."h3DataId")) h3data `;

    // Adding LATERAL SQL string to the main SQL string
    const sqlQuery: string = [
      selectQuery.slice(0, positionToInsertLateral),
      sqlStringForLateral,
      selectQuery.slice(positionToInsertLateral),
    ].join('');



    const tmpTableName: string = H3DataRepository.generateRandomTableName();
    await getManager().query(
      `CREATE TEMPORARY TABLE "${tmpTableName}" AS (${sqlQuery});`,
      selectQueryParams,
    );
    const riskMap: any = await getManager().query(
      `SELECT *
       FROM "${tmpTableName}";`,
    );
    this.logger.log('Impact Map generated');
    const quantiles: number[] = await this.calculateQuantiles(tmpTableName);
    await getManager().query(`DROP TABLE "${tmpTableName}";`);
    return { riskMap, quantiles };
  }

  /**
   * @param indicatorH3Data H3 format data of a Indicator
   * @param producerMaterialH3Data
   * @param harvestMaterialH3Data
   * @param deforestationH3Data Fixed Indicator's H3 Data required to query Biodiversity Loss Risk-Map
   * @param calculusFactor Integer value to perform calculus. Represents the factor
   * @param resolution Integer value that represent the resolution which the h3 response should be calculated
   */
  async getBiodiversityLossRiskMapByResolution(
    indicatorH3Data: H3Data,
    producerMaterialH3Data: H3Data,
    harvestMaterialH3Data: H3Data,
    deforestationH3Data: H3Data,
    calculusFactor: number,
    resolution: number,
  ): Promise<{ riskMap: H3IndexValueData[]; quantiles: number[] }> {
    const tmpTableName: string = H3DataRepository.generateRandomTableName();
    const query: string = getManager()
      .createQueryBuilder()
      .select(` h3_to_parent(risk_calc.h3index, ${resolution})`, 'h')
      .addSelect('sum(risk_calc.bio_risk)', 'v')
      .from((subQuery: SelectQueryBuilder<any>) => {
        return subQuery
          .select(`deforestationh3.h3index`)
          .addSelect(
            `indicatorh3."${indicatorH3Data.h3columnName}" * (${calculusFactor}/0.0001) * ((deforestationh3."${deforestationH3Data.h3columnName}" * harvesth3."${harvestMaterialH3Data.h3columnName}") / (sum(materialh3."${producerMaterialH3Data.h3columnName}") over())) bio_risk`,
          )
          .from(producerMaterialH3Data.h3tableName, 'materialh3')
          .innerJoin(
            indicatorH3Data.h3tableName,
            'indicatorh3',
            `indicatorh3.h3index = materialh3.h3index`,
          )
          .innerJoin(
            deforestationH3Data.h3tableName,
            'deforestationh3',
            'deforestationh3.h3index = materialh3.h3index',
          )
          .innerJoin(
            harvestMaterialH3Data.h3tableName,
            'harvesth3',
            'harvesth3.h3index = materialh3.h3index',
          )
          .andWhere(
            `materialh3."${producerMaterialH3Data.h3columnName}" is not null`,
          )
          .andWhere(`indicatorh3."${indicatorH3Data.h3columnName}" is not null`)
          .andWhere(`materialh3."${producerMaterialH3Data.h3columnName}" > 0`)
          .andWhere(`indicatorh3."${indicatorH3Data.h3columnName}" > 0 `)
          .andWhere(
            `deforestationh3."${deforestationH3Data.h3columnName}" > 0`,
          );
      }, 'risk_calc')
      .groupBy('h')
      .getSql();
    await getManager().query(
      `CREATE TEMPORARY TABLE "${tmpTableName}" AS (${query});`,
    );
    const riskMap: any = await getManager().query(
      `SELECT *
       FROM "${tmpTableName}";`,
    );
    const quantiles: number[] = await this.calculateQuantiles(tmpTableName);

    await getManager().query(`DROP TABLE "${tmpTableName}"`);
    this.logger.log('Biodiversity Map generated');
    return { riskMap, quantiles };
  }

  async getDeforestationLossRiskMapByResolution(
    indicatorH3Data: H3Data,
    producerMaterialH3Data: H3Data,
    harvestMaterialH3Data: H3Data,
    resolution: number,
  ): Promise<{ riskMap: H3IndexValueData[]; quantiles: number[] }> {
    const tmpTableName: string = H3DataRepository.generateRandomTableName();
    const query: string = getManager()
      .createQueryBuilder()
      .select(`h3_to_parent(risk_calc.h3index,${resolution})`, 'h')
      .addSelect(`sum(risk_calc.def_risk)`, 'v')
      .from((subQuery: SelectQueryBuilder<any>) => {
        return subQuery
          .select(`indicatorh3.h3index `)
          .addSelect(
            `(indicatorh3."${indicatorH3Data.h3columnName}" * harvesth3."${harvestMaterialH3Data.h3columnName}") / sum(materialh3."${producerMaterialH3Data.h3columnName}") over() def_risk`,
          )
          .from(producerMaterialH3Data.h3tableName, 'materialh3')
          .innerJoin(
            indicatorH3Data.h3tableName,
            'indicatorh3',
            `indicatorh3.h3index = materialh3.h3index`,
          )
          .innerJoin(
            harvestMaterialH3Data.h3tableName,
            'harvesth3',
            'harvesth3.h3index = materialh3.h3index',
          )
          .where(
            `materialh3."${producerMaterialH3Data.h3columnName}" is not null`,
          )
          .andWhere(`indicatorh3."${indicatorH3Data.h3columnName}" is not null`)
          .andWhere(`materialh3."${producerMaterialH3Data.h3columnName}" <> 0`)
          .andWhere(`indicatorh3."${indicatorH3Data.h3columnName}" <> 0 `)
          .andWhere(`harvesth3."${harvestMaterialH3Data.h3columnName}" > 0`);
      }, 'risk_calc')
      .groupBy('h')
      .getSql();
    await getManager().query(
      `CREATE TEMPORARY TABLE "${tmpTableName}" AS (${query});`,
    );
    const riskMap: any = await getManager().query(
      `SELECT *
       FROM "${tmpTableName}";`,
    );
    const quantiles: number[] = await this.calculateQuantiles(tmpTableName);

    await getManager().query(`DROP TABLE "${tmpTableName}"`);
    this.logger.log('Deforestation Loss Map generated');

    return { riskMap, quantiles };
  }

  async getCarbonEmissionsRiskMapByResolution(
    indicatorH3Data: H3Data,
    producerMaterialH3Data: H3Data,
    harvestMaterialH3Data: H3Data,
    deforestationH3Data: H3Data,
    calculusFactor: number,
    resolution: number,
  ): Promise<{ riskMap: H3IndexValueData[]; quantiles: number[] }> {
    const tmpTableName: string = H3DataRepository.generateRandomTableName();
    const query: string = getManager()
      .createQueryBuilder()
      .select(`h3_to_parent(risk_calc.h3index, ${resolution})`, 'h')
      .addSelect(`sum(risk_calc.carbon_risk)`, 'v')
      .from((subQuery: SelectQueryBuilder<any>) => {
        return subQuery
          .select(`deforestationh3.h3index`)
          .addSelect(
            `indicatorh3."${indicatorH3Data.h3columnName}" * ((deforestationh3."${deforestationH3Data.h3columnName}" * harvesth3."${harvestMaterialH3Data.h3columnName}") / sum(materialh3."${producerMaterialH3Data.h3columnName}") over()) carbon_risk`,
          )
          .from(producerMaterialH3Data.h3tableName, 'materialh3')
          .innerJoin(
            deforestationH3Data.h3tableName,
            'deforestationh3',
            'deforestationh3.h3index = materialh3.h3index',
          )
          .innerJoin(
            harvestMaterialH3Data.h3tableName,
            'harvesth3',
            'harvesth3.h3index = materialh3.h3index',
          )
          .innerJoin(
            indicatorH3Data.h3tableName,
            'indicatorh3',
            'indicatorh3.h3index = materialh3.h3index',
          )
          .where(
            `materialh3."${producerMaterialH3Data.h3columnName}" is not null`,
          )
          .andWhere(
            `deforestationh3."${deforestationH3Data.h3columnName}" is not null`,
          )
          .andWhere(`indicatorh3."${indicatorH3Data.h3columnName}" is not null`)
          .andWhere(
            `deforestationh3."${deforestationH3Data.h3columnName}" <> 0`,
          )
          .andWhere(`harvesth3."${harvestMaterialH3Data.h3columnName}" > 0`);
      }, 'risk_calc')
      .groupBy('h')
      .getSql();

    await getManager().query(
      `CREATE TEMPORARY TABLE "${tmpTableName}" AS (${query});`,
    );
    const riskMap: any = await getManager().query(
      `SELECT *
       FROM "${tmpTableName}";`,
    );
    const quantiles: number[] = await this.calculateQuantiles(tmpTableName);
    await getManager().query(`DROP TABLE "${tmpTableName}"`);
    this.logger.log('Carbon Emissions Map generated');
    return { riskMap, quantiles };
  }

  /**
   * @debt: Refactor this to use queryBuilder. Even tho all values are previously validated, this isn't right, but
   * has been don for the time being to unblock FE. Check with Data if calculus is accurate
   */
  async calculateQuantiles(tmpTableName: string): Promise<number[]> {
    try {
      const resultArray: number[] = await getManager().query(
        `select min(v)                                            as min,
                percentile_cont(0.1667) within group (order by v) as per16,
                percentile_cont(0.3337) within group (order by v) as per33,
                percentile_cont(0.50) within group (order by v)   as per50,
                percentile_cont(0.6667) within group (order by v) as per66,
                percentile_cont(0.8337) within group (order by v) as per83,
                percentile_cont(1) within group (order by v)      as max
         from "${tmpTableName}"
         where v > 0`,
      );
      return Object.values(resultArray[0]);
    } catch (err) {
      this.logger.error(err);
      throw new Error(`Quantiles could not been calculated`);
    }
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
}
