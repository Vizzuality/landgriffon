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
import { GeoRegion } from '../geo-regions/geo-region.entity';

interface SourcingRecordH3Struct {
  sr_id: string;
  harvest_table: string;
  harvest_column: string;
  production_table: string;
  production_column: string;
}

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
    const tmpTableName: string = 'material_map';
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
        `SELECT * FROM ${tmpTableName};`,
      );
      return { materialMap, tmpTableName };
    } catch (err) {
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
  ): Promise<{ riskMap: H3IndexValueData[]; tmpTableName: string }> {
    const tmpTableName: string = 'unsustainable_water_use_riskmap';
    const query: string = getManager()
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
    const riskMap: any = await getManager().query(
      `SELECT * FROM ${tmpTableName};`,
    );
    this.logger.log('Water Risk Map generated');

    return { riskMap, tmpTableName };
  }

  /**
   * @param indicatorH3Data H3 format data of a Indicator
   * @param calculusFactor Integer value to perform calculus. Represents the factor
   * @param resolution Integer value that represent the resolution which the h3 response should be calculated
   * @param groupBy
   */
  async getWaterImpactMapByResolution(
    indicatorH3Data: H3Data,
    calculusFactor: number,
    resolution: number,
    groupBy: string,
  ): Promise<H3IndexValueData[]> {
    const areaTable: string = `h3_grid_spam2010v2r0_global_ha`; // h3_data.tableName based on Material's harvestId
    const areaColumn: string = `spam2010v2r0_global_h_ocer_a`; // h3_data.columnName based on Material's harvestId
    const productionTable: string = `h3_grid_spam2010v2r0_global_prod`; // h3_data.tableName based on Material's producerId
    const productionColumn: string = `spam2010v2r0_global_p_ocer_a`; // h3_data.columnName based on Material's producerId

    const sourcingRecordData: SourcingRecordH3Struct[] = await getManager()
      .query(`
        select sr.id                        sr_id,
               hd_harvest."h3tableName"     harvest_table,
               hd_harvest."h3columnName"    harvest_column,
               hd_production."h3tableName"  production_table,
               hd_production."h3columnName" production_column
        from sourcing_records sr
               left join sourcing_location sl on sl.id = sr."sourcingLocationId"
               left join geo_region gr on gr.id = sl."geoRegionId"
               left join material m on m.id = sl."materialId"
               left join h3_data hd_production on hd_production.id = m."producerId"
               left join h3_data hd_harvest on hd_harvest.id = m."harvestId"
        where m."producerId" is not null
          and m."harvestId" is not null
      `);

    const riskMap: Record<string, number> = {};

    for (const sourcingRecordDataElement of sourcingRecordData) {
      const query: string = `
        select impact.h3index, sum(impact.prob_sourc) sum_impact
        from -- sum impact for all the admin regions
             (select locations.id,
                     materials.h3index,
                     ((locations.tonnage * power(materials.haf, 2)) /
                      (materials.prod * sum(materials.haf * 3612.9052100000004) over (partition by locations.id))) *
                     materials.wf * materials.haf prob_sourc
              from -- probability sourcing area * risk (in this case water)
                   (select sr.id,
                           sr.tonnage,
                           h3_uncompact(gr."h3Compact"::h3index[], 6) h3index --ha.spam2010_global_spaprob aream2010v2r0_global_a_sugc_a haf_ha
                    from sourcing_records sr
                           left join sourcing_location sl
                                     on sl.id = sr."sourcingLocationId" -- join sourcing records with sourcing locations
                           left join geo_region gr on gr.id = sl."geoRegionId" -- get the georegion and the h3 compact data associated
                    where sr.id = '${sourcingRecordDataElement.sr_id}'
                   ) locations
                     inner join
                   (select harvert_table.h3index,
                           harvert_table.${sourcingRecordDataElement.harvest_column}       haf,
                           production_table.${sourcingRecordDataElement.production_column} prod,
                           indicator_table.${indicatorH3Data.h3columnName}                 wf--select h3index, production and harvest area based on sourcing location material Id (producerid and harvestId) and indicator
                    from ${sourcingRecordDataElement.harvest_table} harvert_table
                           left join ${sourcingRecordDataElement.production_table} production_table
                                     on production_table.h3index = harvert_table.h3index --join with h3 production data
                           left join ${indicatorH3Data.h3tableName} indicator_table
                                     on indicator_table.h3index = harvert_table.h3index --select the indicator that we want
                    where harvert_table.${sourcingRecordDataElement.harvest_column} > 0
                      and indicator_table.${indicatorH3Data.h3columnName} > 0
                      and production_table.${sourcingRecordDataElement.production_column} > 0--filter all the harvest area values below 0
                   ) materials
                   on materials.h3index = locations.h3index) impact
        group by impact.h3index
      `;
      const result: {
        h3index: string;
        sum_impact: number;
      }[] = await getManager().query(query);
      result.forEach((element: { h3index: string; sum_impact: number }) => {
        if (riskMap[element.h3index]) {
          riskMap[element.h3index] += element.sum_impact;
        } else {
          riskMap[element.h3index] = element.sum_impact;
        }
      });
    }
    this.logger.log('Water Risk impact map generated');
    return Object.entries(riskMap).map((elem: [string, number]) => {
      return { h: elem[0], v: elem[1] };
    });
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
    materialH3Data: H3Data,
    deforestationH3Data: H3Data,
    calculusFactor: number,
    resolution: number,
  ): Promise<{ riskMap: H3IndexValueData[]; tmpTableName: string }> {
    const tmpTableName: string = 'biodiversity_loss_riskmap';
    const query: string = getManager()
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
    const riskMap: any = await getManager().query(
      `SELECT * FROM ${tmpTableName};`,
    );
    this.logger.log('Biodiversity Loss Map generated');

    return { riskMap, tmpTableName };
  }

  async getDeforestationLossRiskMapByResolution(
    indicatorH3Data: H3Data,
    materialH3Data: H3Data,
    resolution: number,
  ): Promise<{ riskMap: H3IndexValueData[]; tmpTableName: string }> {
    const tmpTableName: string = 'deforestation_loss_riskmap';
    const query: string = getManager()
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
    const riskMap: any = await getManager().query(
      `SELECT * FROM ${tmpTableName};`,
    );
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
    const tmpTableName: string = 'carbon_emissions_riskmap';
    const query: string = getManager()
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
    const riskMap: any = await getManager().query(
      `SELECT * FROM ${tmpTableName};`,
    );

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
