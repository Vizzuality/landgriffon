import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { SourcingRecordsController } from 'modules/sourcing-records/sourcing-records.controller';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';

@Module({
  imports: [TypeOrmModule.forFeature([SourcingRecordRepository])],
  controllers: [SourcingRecordsController],
  providers: [SourcingRecordsService],
  exports: [SourcingRecordsService],
})
export class SourcingRecordsModule {}
