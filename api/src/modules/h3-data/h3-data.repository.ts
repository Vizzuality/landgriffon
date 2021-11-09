import { EntityRepository, getManager, Repository } from 'typeorm';
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

/**
 * @note: Column aliases are marked as 'h' and 'v' so that DB returns data in the format the consumer needs to be
 * So we avoid doing transformations within the API and let the DB handle the heavy job
 */

// TODO: Check this thread for percentile calc: 3612905210000,https://stackoverflow.com/questions/39683330/percentile-calculation-with-a-window-function
@EntityRepository(H3Data)
export class H3DataRepository extends Repository<H3Data> {
  logger: Logger = new Logger(H3DataRepository.name);

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
  ): Promise<{ materialMap: H3IndexValueData[]; tmpTableName: string }> {
    const tmpTableName = 'material_map';
    try {
      const query = getManager()
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
      const materialMap = await getManager().query(
        `SELECT * FROM ${tmpTableName};`,
      );
      return { materialMap, tmpTableName };
    } catch (err) {
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
  ): Promise<{ riskMap: H3IndexValueData[]; tmpTableName: string }> {
    const tmpTableName = 'unsustainable_water_use_riskmap';
    const query = getManager()
      .createQueryBuilder()
      .select(`h3_to_parent(indicatorh3.h3index, ${resolution})`, 'h')
      .addSelect(
        `sum(indicatorh3.${indicatorH3Data.h3columnName} * (materialh3.${materialH3Data.h3columnName} * (1/${calculusFactor})))`,
        'v',
      )
      .from(materialH3Data.h3tableName, 'materialh3')
      .innerJoin(
        indicatorH3Data.h3tableName,
        'indicatorh3',
        `indicatorh3.h3index = materialh3.h3index`,
      )
      .where(`indicatorh3.h3index = materialh3.h3index`)
      .andWhere(`materialh3.${materialH3Data.h3columnName} is not null`)
      .andWhere(`indicatorh3.${indicatorH3Data.h3columnName} is not null`)
      .groupBy('h')
      .getSql();
    await getManager().query(
      `CREATE TEMPORARY TABLE ${tmpTableName} AS (${query});`,
    );
    const riskMap = await getManager().query(`SELECT * FROM ${tmpTableName};`);
    this.logger.log('Water Risk Map generated');

    return { riskMap, tmpTableName };
  }

  /**
   *
   * @param indicatorH3Data H3 format data of a Indicator
   * @param materialH3Data  H3 format data of a material
   * @param deforestationH3Data Fixed Indicator's H3 Data required to query Biodiversity Loss Risk-Map
   * @param calculusFactor Integer value to perform calculus. Represents the factor
   * @param resolution Integer value that represent the resolution which the h3 response should be calculated
   */
  async getBiodiversityLossRiskMapByResolution(
    indicatorH3Data: H3Data,
    materialH3Data: H3Data,
    deforestationH3Data: H3Data,
    calculusFactor: number,
    resolution: number,
  ): Promise<{ riskMap: H3IndexValueData[]; tmpTableName: string }> {
    const tmpTableName = 'biodiversity_loss_riskmap';
    const query = getManager()
      .createQueryBuilder()
      .select(`h3_to_parent(deforestationh3.h3index, ${resolution})`, 'h')
      .addSelect(
        `sum(deforestationh3.${deforestationH3Data.h3columnName} * (materialh3.${materialH3Data.h3columnName}*h3_hex_area(6)*100) * indicatorh3.${indicatorH3Data.h3columnName}*(1/${calculusFactor}))`,
        'v',
      )
      .from(deforestationH3Data.h3tableName, 'deforestationh3')
      .leftJoin(
        indicatorH3Data.h3tableName,
        'indicatorh3',
        'indicatorh3.h3index = deforestationh3.h3index',
      )
      .leftJoin(
        materialH3Data.h3tableName,
        'materialh3',
        'materialh3.h3index = deforestationh3.h3index',
      )
      .where(`deforestationh3.${deforestationH3Data.h3columnName} > 0`)
      .andWhere(`materialh3.${materialH3Data.h3columnName} > 0`)
      .andWhere(`indicatorh3.${indicatorH3Data.h3columnName} is not null`)
      .groupBy('h')
      .getSql();
    await getManager().query(
      `CREATE TEMPORARY TABLE ${tmpTableName} AS (${query});`,
    );
    const riskMap = await getManager().query(`SELECT * FROM ${tmpTableName};`);
    this.logger.log('Biodiversity Loss Map generated');

    return { riskMap, tmpTableName };
  }

  async getDeforestationLossRiskMapByResolution(
    indicatorH3Data: H3Data,
    materialH3Data: H3Data,
    resolution: number,
  ): Promise<{ riskMap: H3IndexValueData[]; tmpTableName: string }> {
    const tmpTableName = 'deforestation_loss_riskmap';
    const query = getManager()
      .createQueryBuilder()
      .select(`h3_to_parent(indicatorh3.h3index, ${resolution})`, 'h')
      .addSelect(
        `sum(indicatorh3.${indicatorH3Data.h3columnName} * (materialh3.${materialH3Data.h3columnName})*h3_hex_area(6)*100)`,
        'v',
      )
      .from(materialH3Data.h3tableName, 'materialh3')
      .innerJoin(
        indicatorH3Data.h3tableName,
        'indicatorh3',
        `indicatorh3.h3index = materialh3.h3index`,
      )
      .where(`indicatorh3.h3index = materialh3.h3index`)
      .andWhere(`materialh3.${materialH3Data.h3columnName} is not null`)
      .andWhere(`indicatorh3.${indicatorH3Data.h3columnName} is not null`)
      .andWhere(`materialh3.${materialH3Data.h3columnName} <> 0`)
      .andWhere(`indicatorh3.${indicatorH3Data.h3columnName} <> 0 `)
      .groupBy('h')
      .getSql();
    await getManager().query(
      `CREATE TEMPORARY TABLE ${tmpTableName} AS (${query});`,
    );
    const riskMap = await getManager().query(`SELECT * FROM ${tmpTableName};`);
    this.logger.log('Deforestation Loss Map generated');

    return { riskMap, tmpTableName };
  }

  async getCarbonEmissionsRiskMapByResolution(
    indicatorH3Data: H3Data,
    materialH3Data: H3Data,
    deforestationH3Data: H3Data,
    calculusFactor: number,
    resolution: number,
  ): Promise<{ riskMap: H3IndexValueData[]; tmpTableName: string }> {
    const tmpTableName = 'carbon_emissions_riskmap';
    const query = getManager()
      .createQueryBuilder()
      .select(`h3_to_parent(deforestationh3.h3index, ${resolution})`, 'h')
      .addSelect(
        `sum(deforestationh3.${deforestationH3Data.h3columnName} * (materialh3.${materialH3Data.h3columnName}*h3_hex_area(6)*100) * indicatorh3.${indicatorH3Data.h3columnName})`,
        'v',
      )
      .from(deforestationH3Data.h3tableName, 'deforestationh3')
      .leftJoin(
        indicatorH3Data.h3tableName,
        'indicatorh3',
        'indicatorh3.h3index = deforestationh3.h3index',
      )
      .leftJoin(
        materialH3Data.h3tableName,
        'materialh3',
        'materialh3.h3index = deforestationh3.h3index',
      )
      .where(`deforestationh3.${deforestationH3Data.h3columnName} > 0`)
      .andWhere(`materialh3.${materialH3Data.h3columnName} > 0`)
      .andWhere(`indicatorh3.${indicatorH3Data.h3columnName} is not null`)
      .groupBy('h')
      .getSql();
    await getManager().query(
      `CREATE TEMPORARY TABLE ${tmpTableName} AS (${query});`,
    );
    const riskMap = await getManager().query(`SELECT * FROM ${tmpTableName};`);

    this.logger.log('Carbon Emissions Map generated');

    return { riskMap, tmpTableName };
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
         from ${tmpTableName}
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
    const queryBuilder = this.createQueryBuilder('h')
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
    const availableYears = await queryBuilder.getRawMany();
    return availableYears.map((elem: { year: number }) => elem.year);
  }
}
