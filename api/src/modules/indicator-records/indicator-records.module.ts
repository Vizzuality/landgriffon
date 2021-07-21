import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorRecordsController } from 'modules/indicator-records/indicator-records.controller';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IndicatorRecordRepository])],
  controllers: [IndicatorRecordsController],
  providers: [IndicatorRecordsService],
})
export class IndicatorRecordsModule {}
