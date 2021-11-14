import {
  EntityRepository,
  getManager,
  Repository,
  SelectQueryBuilder,
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
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { Indicator } from 'modules/indicators/indicator.entity';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';

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
      const result:
        | H3IndexValueData[]
        | undefined = await getManager()
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
    const tmpTableName: string = 'test1';
    try {
      const query: string = getManager()
        .createQueryBuilder()
        .select(`h3_to_parent(h3index, ${resolution})`, 'h')
        .addSelect(`sum(${materialH3Data.h3columnName})`, 'v')
        .from(`${materialH3Data.h3tableName}`, 'h3table')
        .where(`${materialH3Data.h3columnName} is not null`)
        .andWhere(`${materialH3Data.h3columnName} <> 0`)
        .groupBy('h')
        .getSql();

      this.logger.log('Material Map generated');
      await getManager().query(
        `CREATE TEMPORARY TABLE ${tmpTableName} AS (${query});`,
      );
      const materialMap: any = await getManager().query(
        `SELECT *
         FROM ${tmpTableName};`,
      );
      const quantiles: number[] = await this.calculateQuantiles(tmpTableName);
      // await getManager().query(`DROP TABLE ${tmpTableName};`);
      return { materialMap, quantiles };
    } catch (err) {
      this.logger.error(err);
      throw new ServiceUnavailableException(
        'Material Map could not been generated',
      );
    }
  }

  async getH3SumForGeoRegion(
    h3TableName: string,
    h3ColumnName: string,
    geoRegionId: string,
  ): Promise<number> {
    const sum: any = await getManager()
      .createQueryBuilder()
      .select(`sum(h3table.${h3ColumnName})`, 'sum')
      .from(h3TableName.toLowerCase(), 'h3table')
      .innerJoin(
        (subQuery: SelectQueryBuilder<any>) => {
          return subQuery
            .select('h3_uncompact(gr."h3Compact"::h3index[], 6)', 'h3index')
            .from(GeoRegion, 'gr')
            .where('gr.id = :geoRegionId');
        },
        'georegionh3',
        'h3table.h3index = georegionh3.h3index',
      )
      .setParameter('geoRegionId', geoRegionId)
      .getRawOne();

    return sum.sum;
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
    const tmpTableName: string = 'test2';
    const query: string = getManager()
      .createQueryBuilder()
      .select(`h3_to_parent(risk_calc.h3index, ${resolution})`, 'h')
      .addSelect(`sum(risk_calc.water_risk)`, 'v')
      .from((subQuery: SelectQueryBuilder<any>) => {
        return subQuery
          .select(`indicatorh3.h3index `)
          .addSelect(
            `indicatorh3.${indicatorH3Data.h3columnName}* 103 / sum(materialh3.${materialH3Data.h3columnName}) over() water_risk`,
          )
          .from(materialH3Data.h3tableName, 'materialh3')
          .innerJoin(
            indicatorH3Data.h3tableName,
            'indicatorh3',
            'indicatorh3.h3index = materialh3.h3index',
          )
          .where(`materialh3.${materialH3Data.h3columnName} is not null`)
          .andWhere(`indicatorh3.${indicatorH3Data.h3columnName} is not null`);
      }, 'risk_calc')
      .groupBy('h')
      .getSql();

    await getManager().query(
      `CREATE TEMPORARY TABLE "${tmpTableName}" AS (${query});`,
    );
    const riskMap: any = await getManager().query(
      `SELECT * FROM ${tmpTableName};`,
    );
    const quantiles: number[] = await this.calculateQuantiles(tmpTableName);
    // await getManager().query(`DROP TABLE "${tmpTableName}";`);
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
    groupBy: string,
    year: number,
    materialIds?: string[],
  ): Promise<{ riskMap: H3IndexValueData[]; quantiles: number[] }> {
    const query: SelectQueryBuilder<any> = getManager()
      .createQueryBuilder()
      .select('unnest(gr."h3Flat")', 'h')
      .addSelect('sum(ir.value/gr."h3FlatLength")', 'v')
      .from(SourcingLocation, 'sl')
      .innerJoin('sourcing_records', 'sr', 'sl.id = sr.sourcingLocationId')
      .innerJoin('indicator_record', 'ir', 'sr.id = ir.sourcingRecordId')
      .innerJoin('geo_region', 'gr', 'sl.geoRegionId = gr.id')
      .where('ir.indicatorId = :indicatorId', { indicatorId: indicator.id })
      .andWhere('sr.year = :year', { year })
      .andWhere('gr."h3FlatLength" > 0')
      .groupBy('h');

    if (materialIds) {
      query.andWhere('sl.material IN (:...materialIds)', { materialIds });
    }

    const tmpTableName: string = H3DataRepository.generateRandomTableName();
    const [queryString, params] = query.getQueryAndParameters();
    await getManager().query(
      `CREATE TEMPORARY TABLE "${tmpTableName}" AS (${queryString});`,
      params,
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
   * @param materialH3Data  H3 format data of a material
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
    const tmpTableName: string = 'test3';
    const query: string = getManager()
      .createQueryBuilder()
      .select(` h3_to_parent(risk_calc.h3index, ${resolution})`, 'h')
      .addSelect('sum(risk_calc.bio_risk)', 'v')
      .from((subQuery: SelectQueryBuilder<any>) => {
        return subQuery
          .select(`deforestationh3.h3index`)
          .addSelect(
            `indicatorh3.${indicatorH3Data.h3columnName} * (${calculusFactor}/0.0001) * ((deforestationh3.${deforestationH3Data.h3columnName} * harvesth3.${harvestMaterialH3Data.h3columnName}) / (sum(materialh3.${producerMaterialH3Data.h3columnName}) over())) bio_risk`,
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
            `materialh3.${producerMaterialH3Data.h3columnName} is not null`,
          )
          .andWhere(`indicatorh3.${indicatorH3Data.h3columnName} is not null`)
          .andWhere(`materialh3.${producerMaterialH3Data.h3columnName} > 0`)
          .andWhere(`indicatorh3.${indicatorH3Data.h3columnName} > 0 `)
          .andWhere(`deforestationh3.${deforestationH3Data.h3columnName} > 0`);
      }, 'risk_calc')
      .groupBy('h')
      .getSql();
    await getManager().query(
      `CREATE TEMPORARY TABLE ${tmpTableName} AS (${query});`,
    );
    const riskMap: any = await getManager().query(
      `SELECT *
       FROM ${tmpTableName};`,
    );
    const quantiles: number[] = await this.calculateQuantiles(tmpTableName);
    // await getManager().query(`DROP TABLE "${tmpTableName}";`);
    this.logger.log('Biodiversity Map generated');
    return { riskMap, quantiles };
  }

  // TODO
  async getDeforestationLossRiskMapByResolution(
    indicatorH3Data: H3Data,
    producerMaterialH3Data: H3Data,
    harvestMaterialH3Data: H3Data,
    resolution: number,
  ): Promise<{ riskMap: H3IndexValueData[]; quantiles: number[] }> {
    const tmpTableName: string = 'test4';
    const query: string = getManager()
      .createQueryBuilder()
      .select(`h3_to_parent(risk_calc.h3index,${resolution})`, 'h')
      .addSelect(`sum(risk_calc.def_risk)`, 'v')
      .from((subQuery: SelectQueryBuilder<any>) => {
        return subQuery
          .select(`indicatorh3.h3index `)
          .addSelect(
            `(indicatorh3.${indicatorH3Data.h3columnName} * harvesth3.${harvestMaterialH3Data.h3columnName}) / sum(materialh3.${producerMaterialH3Data.h3columnName}) over() def_risk`,
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
            `materialh3.${producerMaterialH3Data.h3columnName} is not null`,
          )
          .andWhere(`indicatorh3.${indicatorH3Data.h3columnName} is not null`)
          .andWhere(`materialh3.${producerMaterialH3Data.h3columnName} <> 0`)
          .andWhere(`indicatorh3.${indicatorH3Data.h3columnName} <> 0 `)
          .andWhere(`harvesth3.${harvestMaterialH3Data.h3columnName} > 0`);
      }, 'risk_calc')
      .groupBy('h')
      .getSql();
    await getManager().query(
      `CREATE TEMPORARY TABLE ${tmpTableName} AS (${query});`,
    );
    const riskMap: any = await getManager().query(
      `SELECT *
       FROM ${tmpTableName};`,
    );
    const quantiles: number[] = await this.calculateQuantiles(tmpTableName);
    //await getManager().query(`DROP TABLE "${tmpTableName}";`);
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
    const tmpTableName: string = 'test5';
    const query: string = getManager()
      .createQueryBuilder()
      .select(`h3_to_parent(risk_calc.h3index, ${resolution})`, 'h')
      .addSelect(`sum(risk_calc.carbon_risk)`, 'v')
      .from((subQuery: SelectQueryBuilder<any>) => {
        return subQuery
          .select(`deforestationh3.h3index`)
          .addSelect(
            `indicatorh3.${indicatorH3Data.h3columnName} * ((deforestationh3.${deforestationH3Data.h3columnName} * harvesth3.${harvestMaterialH3Data.h3columnName}) / sum(materialh3.${producerMaterialH3Data.h3columnName}) over()) carbon_risk`,
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
            `materialh3.${producerMaterialH3Data.h3columnName} is not null`,
          )
          .andWhere(
            `deforestationh3.${deforestationH3Data.h3columnName} is not null`,
          )
          .andWhere(`indicatorh3.${indicatorH3Data.h3columnName} is not null`)
          .andWhere(`deforestationh3.${deforestationH3Data.h3columnName} <> 0`)
          .andWhere(`harvesth3.${harvestMaterialH3Data.h3columnName} > 0`);
      }, 'risk_calc')
      .groupBy('h')
      .getSql();

    await getManager().query(
      `CREATE TEMPORARY TABLE ${tmpTableName} AS (${query});`,
    );
    const riskMap: any = await getManager().query(
      `SELECT *
       FROM ${tmpTableName};`,
    );
    const quantiles: number[] = await this.calculateQuantiles(tmpTableName);
    // await getManager().query(`DROP TABLE "${tmpTableName}";`);
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
        `select min(v)                                      as min,
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
    harvestId?: string;
    producerId?: string;
    indicatorId?: string;
  }): Promise<number[]> {
    const queryBuilder: SelectQueryBuilder<H3Data> = this.createQueryBuilder(
      'h',
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
    // If a producerId or harvestId is provided, filter by them.
    if (yearsRequestParams.producerId) {
      queryBuilder.where(`h.id=:id`, {
        id: yearsRequestParams.producerId,
      });
    }
    if (yearsRequestParams.harvestId) {
      queryBuilder.where(`h.id=:id`, {
        id: yearsRequestParams.harvestId,
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
}
