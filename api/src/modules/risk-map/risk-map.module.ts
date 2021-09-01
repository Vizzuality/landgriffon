import { Module } from '@nestjs/common';
import { RiskMapService } from 'modules/risk-map/risk-map.service';
import { RiskMapController } from 'modules/risk-map/risk-map.controller';
import { MaterialsModule } from 'modules/materials/materials.module';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { IndicatorSourcesModule } from 'modules/indicator-sources/indicator-sources.module';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { UnitConversionsModule } from 'modules/unit-conversions/unit-conversions.module';

@Module({
  imports: [
    MaterialsModule,
    IndicatorsModule,
    IndicatorSourcesModule,
    H3DataModule,
    UnitConversionsModule,
  ],
  providers: [RiskMapService],
  controllers: [RiskMapController],
})
export class RiskMapModule {}
