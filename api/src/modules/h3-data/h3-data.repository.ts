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
import { Logger, NotFoundException } from '@nestjs/common';
import { INDICATOR_TYPES } from 'modules/indicators/indicator.entity';
import { MATERIAL_TO_H3_TYPE } from 'modules/materials/material-to-h3.entity';

/**
 * @note: Column aliases are marked as 'h' and 'v' so that DB returns data in the format the consumer needs to be
 * So we avoid doing transformations within the API and let the DB handle the heavy job
 */

// TODO: Check this thread for percentile calc: 3612905210000,https://stackoverflow.com/questions/39683330/percentile-calculation-with-a-window-function
@EntityRepository(H3Data)
export class H3DataRepository extends Repository<H3Data> {
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
      const result: H3IndexValueData[] | undefined = await getManager()
        .createQueryBuilder()
        .select('h3index', 'h')
        .addSelect(`"${h3ColumnName}"`, 'v')
        .from(`${h3TableName}`, 'h3')
        .getRawMany();

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
      const query: SelectQueryBuilder<unknown> = getManager()
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
   * @param materialH3Data: H3 Data table and column name for a specific material
   * @param resolution: An integer between 1 (min resolution) and 6 (max resolution).
   * Resolution validation done at route handler
   *
   */

  /**
   * @debt: Refactor this to use queryBuilder. Even tho all values are previously validated, this isn't right, but
   * has been don for the time being to unblock FE. Check with Data if calculus is accurate
   */
  async calculateQuantiles(tmpTableName: string): Promise<number[]> {
    try {
      const resultArray: number[] = await getManager().query(
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
    const queryBuilder: SelectQueryBuilder<H3Data> = getManager()
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
    type: INDICATOR_TYPES,
    year: number,
  ): Promise<H3Data | undefined> {
    const queryBuilder: SelectQueryBuilder<H3Data> = getManager()
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

    const queryBuilder: SelectQueryBuilder<H3Data> = getManager()
      .createQueryBuilder()
      .select(' h3data.*')
      .from(H3Data, 'h3data')
      .where(`h3data."contextualLayerId" = '${contextualLayerId}'`)
      .orderBy(`h3data.year`, 'DESC')
      .limit(1);
    return queryBuilder.getRawOne();
  }
}
