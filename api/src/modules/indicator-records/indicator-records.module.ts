import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorRecordsController } from 'modules/indicator-records/indicator-records.controller';
import { IndicatorRecordsService } from 'modules/indicator-records/indicator-records.service';
import { IndicatorRecordRepository } from 'modules/indicator-records/indicator-record.repository';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { H3FilterYearsByLayerService } from 'modules/h3-data/services/h3-filter-years-by-layer.service';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndicatorRecordRepository]),
    IndicatorsModule,
    H3DataModule,
    MaterialsModule,
    SourcingRecordsModule,
  ],
  controllers: [IndicatorRecordsController],
  providers: [
    IndicatorRecordsService,
    H3FilterYearsByLayerService,
    H3DataRepository,
  ],
  exports: [IndicatorRecordsService],
})
export class IndicatorRecordsModule {}
