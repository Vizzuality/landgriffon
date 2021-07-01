import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { SourcingRecordsController } from 'modules/sourcing-records/sourcing-records.controller';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { FileModule } from 'modules/files/file.module';

@Module({
  imports: [TypeOrmModule.forFeature([SourcingRecordRepository]), FileModule],
  controllers: [SourcingRecordsController],
  providers: [SourcingRecordsService],
  exports: [SourcingRecordsService],
})
export class SourcingRecordsModule {}
