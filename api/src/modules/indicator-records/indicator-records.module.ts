import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorRecordsController } from 'modules/indicator-records/indicator-records.controller';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { CachedDataModule } from 'modules/cached-data/cached-data.module';
import { ImpactCalculator } from 'modules/indicator-records/services/impact-calculator.service';
import { IndicatorQueryDependencyManager } from 'modules/indicator-records/services/indicator-dependency-manager.service';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndicatorRecord]),
    IndicatorsModule,
    H3DataModule,
    MaterialsModule,
    SourcingRecordsModule,
    CachedDataModule,
  ],
  controllers: [IndicatorRecordsController],
  providers: [
    IndicatorRecordsService,
    IndicatorRecordRepository,
    ImpactCalculator,
    IndicatorQueryDependencyManager,
  ],
  exports: [
    IndicatorRecordsService,
    IndicatorRecordRepository,
    ImpactCalculator,
    IndicatorQueryDependencyManager,
  ],
})
export class IndicatorRecordsModule {}
