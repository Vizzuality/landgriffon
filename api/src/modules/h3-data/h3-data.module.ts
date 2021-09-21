import { Module } from '@nestjs/common';
import { H3DataController } from 'modules/h3-data/h3-data.controller';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { MaterialsModule } from 'modules/materials/materials.module';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { UnitConversionsModule } from 'modules/unit-conversions/unit-conversions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([H3DataRepository]),
    MaterialsModule,
    IndicatorsModule,
    UnitConversionsModule,
  ],
  controllers: [H3DataController],
  providers: [H3DataService],
  exports: [H3DataService],
})
export class H3DataModule {}
