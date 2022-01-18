import { Module } from '@nestjs/common';
import { ImpactService } from 'modules/impact/impact.service';
import { ImpactController } from 'modules/impact/impact.controller';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { MaterialsModule } from 'modules/materials/materials.module';

@Module({
  imports: [IndicatorsModule, SourcingRecordsModule, MaterialsModule],
  providers: [ImpactService],
  controllers: [ImpactController],
  exports: [ImpactService],
})
export class ImpactModule {}
