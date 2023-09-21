import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import {
  CONTEXTUAL_LAYER_AGG_TYPE,
  ContextualLayer,
} from 'modules/contextual-layers/contextual-layer.entity';
import { H3IndexValueData } from 'modules/h3-data/entities/h3-data.entity';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ContextualLayerRepository extends Repository<ContextualLayer> {
  constructor(private dataSource: DataSource) {
    super(ContextualLayer, dataSource.createEntityManager());
  }

  /**
   * Retrieves data from dynamically generated H3 data aggregating by H3 index for the given resolution,
   * and by the type of aggregation determined by aggregationType
   * if no resolution is given, the h3 index of the max resolution available is served as found
   * @param h3TableName
   * @param h3ColumnName
   * @param resolution
   * @param aggregationType
   */
  async getAggregatedH3ByNameAndResolution(
    h3TableName: string,
    h3ColumnName: string,
    resolution: number,
    aggregationType: CONTEXTUAL_LAYER_AGG_TYPE,
  ): Promise<H3IndexValueData[]> {
    try {
      let aggregationSelect: string;

      switch (aggregationType) {
        case CONTEXTUAL_LAYER_AGG_TYPE.SUM:
          aggregationSelect = `sum("${h3ColumnName}")`;
          break;
        case CONTEXTUAL_LAYER_AGG_TYPE.MAX:
          aggregationSelect = `max("${h3ColumnName}")`;
          break;
        case CONTEXTUAL_LAYER_AGG_TYPE.MIN:
          aggregationSelect = `min("${h3ColumnName}")`;
          break;
        case CONTEXTUAL_LAYER_AGG_TYPE.MEAN:
          aggregationSelect = `avg("${h3ColumnName}")`;
          break;
        case CONTEXTUAL_LAYER_AGG_TYPE.MEDIAN:
          // https://towardsdatascience.com/how-to-derive-summary-statistics-using-postgresql-742f3cdc0f44
          aggregationSelect = `percentile_disc(0.5) within group (order by "${h3ColumnName}")`;
          break;
        case CONTEXTUAL_LAYER_AGG_TYPE.MODE:
          aggregationSelect = `mode() within group (order by "${h3ColumnName}")`;
          break;
        default:
          aggregationSelect = `"${h3ColumnName}"`;
          break;
      }

      const query: SelectQueryBuilder<any> = this.dataSource
        .createQueryBuilder()
        .select(`h3_to_parent(h3index, ${resolution})`, 'h')
        .addSelect(aggregationSelect, 'v')
        .from(`${h3TableName}`, 'h3')
        .where(`"${h3ColumnName}" is not null`)
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
}
