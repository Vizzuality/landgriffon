import { EntityRepository, Repository } from 'typeorm';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { NotFoundException } from '@nestjs/common';

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
      return h3DataResult.reduce(
        (acc: any, cur: any) =>
          Object.assign(acc, { [cur['h3index']]: cur[h3ColumnName] }),
        {},
      );
    } catch (err) {
      throw new NotFoundException(
        `H3 ${h3ColumnName} data in ${h3TableName} could not been found`,
      );
    }
  }
}
