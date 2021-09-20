import { EntityRepository, Repository, getManager } from 'typeorm';
import { H3Data, H3IndexValueData } from 'modules/h3-data/h3-data.entity';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';

/**
 * @note: Column aliases are marked as 'h' and 'v' so that DB returns data in the format the consumer needs to be
 * So we avoid doing transformations within the API and let the DB handle the heavy job
 */

@EntityRepository(H3Data)
export class H3DataRepository extends Repository<H3Data> {
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
    const h3DataResult = await this.createQueryBuilder()
      .select('h3index', 'h')
      .addSelect(`${h3ColumnName}`, 'v')
      .getRawOne();

    if (!h3DataResult) {
      throw new NotFoundException(
        `H3 ${h3ColumnName} data in ${h3TableName} could not been found`,
      );
    }
    return h3DataResult;
  }

  /** Retrieves single crop data by a given resolution
   *
   * @param h3Id: Name of the column inside the dynamically generated table
   * @param resolution: An interger between 1 (min resolution) and 6 (max resolution).
   * Resolution validation done at route handler
   *
   */

  async getH3ByIdAndResolution(h3Id: string, resolution: number): Promise<any> {
    const h3Info = await this.createQueryBuilder('h3')
      .select('"h3tableName"')
      .addSelect('"h3columnName"')
      .where('h3.id = :id', { id: h3Id })
      .getRawOne();

    if (!h3Info)
      throw new NotFoundException(
        `Requested H3 with ID: ${h3Id} could not been found`,
      );

    return await getManager()
      .createQueryBuilder()
      .select(`h3_to_parent(h3index, ${resolution})`, 'h')
      .addSelect(`sum(${h3Info.h3columnName})`, 'v')
      .from(`${h3Info.h3tableName}`, 'h3table')
      .groupBy('h')
      .getRawMany();
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
  ): Promise<H3IndexValueData[]> {
    const riskmap = await getManager()
      .createQueryBuilder()
      .select('materialh3.h3index', 'h')
      .addSelect(
        `indicatorh3.${indicatorH3Data.h3columnName} * ${materialH3Data.h3columnName} / ${calculusFactor} `,
        'v',
      )
      .from(materialH3Data.h3tableName, 'materialh3')
      .addFrom(indicatorH3Data.h3tableName, 'indicatorh3')
      .where(`indicatorh3.h3index = materialh3.h3index`)
      .getRawMany();

    if (!riskmap) {
      throw new ServiceUnavailableException(
        'RiskMap could not been calculated',
      );
    }
    return riskmap;
  }
}
