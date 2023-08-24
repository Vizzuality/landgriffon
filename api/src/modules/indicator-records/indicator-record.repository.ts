import { DataSource } from 'typeorm';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Injectable, Logger } from '@nestjs/common';
import { AppBaseRepository } from 'utils/app-base.repository';

@Injectable()
export class IndicatorRecordRepository extends AppBaseRepository<IndicatorRecord> {
  constructor(protected dataSource: DataSource) {
    super(IndicatorRecord, dataSource.createEntityManager());
  }

  logger: Logger = new Logger(IndicatorRecordRepository.name);
}
