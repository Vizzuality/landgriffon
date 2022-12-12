import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { SourcingRecordsController } from 'modules/sourcing-records/sourcing-records.controller';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SourcingRecord])],
  controllers: [SourcingRecordsController],
  providers: [SourcingRecordsService, SourcingRecordRepository],
  exports: [SourcingRecordsService, SourcingRecordRepository],
})
export class SourcingRecordsModule {}
