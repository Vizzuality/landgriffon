import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingRecordsRepository } from './sourcing-records.repository';

@Module({ imports: [TypeOrmModule.forFeature([SourcingRecordsRepository])] })
export class SourcingRecordsModule {}
