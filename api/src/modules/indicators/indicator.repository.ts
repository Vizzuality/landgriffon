import { EntityRepository, Repository } from 'typeorm';
import { Indicator } from 'modules/indicators/indicator.entity';

@EntityRepository(Indicator)
export class IndicatorRepository extends Repository<Indicator> {
  //TODO add response DTO
  async getIndicatorDataBySourcingRecord(
    sourcingRecordId: string,
  ): Promise<void> {
    const queryResponse = await this.createQueryBuilder();
  }
}
