import { Module } from '@nestjs/common';
import { ImpactService } from 'modules/impact/impact.service';
import { ImpactController } from 'modules/impact/impact.controller';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';

@Module({
  imports: [
    IndicatorsModule,
    SourcingRecordsModule,
    SourcingLocationsModule,
    MaterialsModule,
    AdminRegionsModule,
    SuppliersModule,
  ],
  providers: [ImpactService],
  controllers: [ImpactController],
  exports: [ImpactService],
})
export class ImpactModule {}
