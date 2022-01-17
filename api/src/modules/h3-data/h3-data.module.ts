import { Module } from '@nestjs/common';
import { H3DataController } from 'modules/h3-data/h3-data.controller';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { MaterialsModule } from 'modules/materials/materials.module';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { UnitConversionsModule } from 'modules/unit-conversions/unit-conversions.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { H3DataYearsService } from 'modules/h3-data/services/h3-data-years.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([H3DataRepository]),
    MaterialsModule,
    IndicatorsModule,
    UnitConversionsModule,
    SourcingRecordsModule,
  ],
  controllers: [H3DataController],
  providers: [H3DataService, H3DataYearsService],
  exports: [H3DataService, H3DataYearsService],
})
export class H3DataModule {}
