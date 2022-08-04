import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorRecordsController } from 'modules/indicator-records/indicator-records.controller';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { CachedDataModule } from 'modules/cached-data/cached-data.module';
import { ImpactCalculatorService } from 'modules/indicator-records/services/impact-calculator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndicatorRecordRepository]),
    IndicatorsModule,
    H3DataModule,
    MaterialsModule,
    SourcingRecordsModule,
    CachedDataModule,
  ],
  controllers: [IndicatorRecordsController],
  providers: [IndicatorRecordsService, ImpactCalculatorService],
  exports: [IndicatorRecordsService],
})
export class IndicatorRecordsModule {}
