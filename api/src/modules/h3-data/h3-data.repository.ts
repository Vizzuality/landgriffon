import { EntityRepository, Repository } from 'typeorm';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { h3Reducer } from 'modules/h3-data/helpers/h3reducer.helper';

@EntityRepository(H3Data)
export class H3DataRepository extends Repository<H3Data> {
  /** Retrieves data from dynamically generated H3 data
   *
   * @param h3ColumnName: Name of the column inside the dynamically generated table
   * @param h3TableName: Name of the dynamically generated table
   *
   * @returns: Single object with the h3Index as property key, and its value
   */
  async findH3ByName(
    h3TableName: string,
    h3ColumnName: string,
  ): Promise<H3IndexValueData> {
    try {
      const h3DataResult = await this.query(
        `SELECT h3index, ${h3ColumnName} FROM ${h3TableName}`,
      );
      return h3Reducer(h3DataResult, 'h3index', h3ColumnName);
    } catch (err) {
      throw new NotFoundException(
        `H3 ${h3ColumnName} data in ${h3TableName} could not been found`,
      );
    }
  }

  /** Retrieves single crop data by a given resolution
   *
   * @param h3Id: Name of the column inside the dynamically generated table
   * @param resolution: An interger between 1 (min resolution) and 6 (max resolution).
   * Resolution validation done at route handler
   *
   * @returns: Single object with the h3Index as property key, and its value
   *
   * @debt: This should be done on a single raw sql query, but I couldn't make it work
   * Super Senior powers requested
   */

  async getH3ByIdAndResolution(
    h3Id: string,
    resolution: number,
  ): Promise<H3IndexValueData> {
    const h3Info = await this.createQueryBuilder('h3')
      .select('"h3tableName"')
      .addSelect('"h3columnName"')
      .where('h3.id = :id', { id: h3Id })
      .getRawOne();

    if (!h3Info)
      throw new NotFoundException(
        `Requested H3 with ID: ${h3Id} could not been found`,
      );
    try {
      const h3data = await this.query(
        `select h3_to_parent(h3index, ${resolution}) as h3_to_parent, sum(${h3Info.h3columnName})
               from ${h3Info.h3tableName} hgsvrgp group by h3_to_parent`,
      );

      return h3Reducer(h3data, 'h3_to_parent', 'sum');
    } catch (err) {
      throw new ServiceUnavailableException(
        `H3 indexes with ID: ${h3Id} could not been calculated to resolution ${resolution}`,
      );
    }
  }

  /**
   *
   * @param indicatorH3Data H3 format data of a Indicator
   * @param materialH3Data  H3 format data of a material
   * @param calculusFactor Integer value to perform calculus. Represents the factor
   */

  async calculateRiskMapByMaterialAndIndicator(
    indicatorH3Data: H3Data,
    materialH3Data: H3Data,
    calculusFactor: number,
  ): Promise<H3IndexValueData> {
    /**
     * @debt: Check with data if the result of this query should be cached
     */
    try {
      const riskmap = await this.query(
        `SELECT tmp.matchingh3indexes, tmp.indicatorvalues*tmp.materialvalues/${calculusFactor} AS valuesresult FROM ` +
          `(SELECT m.h3index AS matchingh3indexes, i.${indicatorH3Data.h3columnName} AS indicatorvalues, ` +
          `${materialH3Data.h3columnName} AS materialvalues FROM ${materialH3Data.h3tableName} AS m, ` +
          `${indicatorH3Data.h3tableName} AS i WHERE i.h3index = m.h3index) AS tmp`,
      );
      return h3Reducer(riskmap, 'matchingh3indexes', 'valuesresult');
    } catch (err) {
      throw new ServiceUnavailableException(
        `Risk Map could not been generated: ` + err,
      );
    }
  }
}
