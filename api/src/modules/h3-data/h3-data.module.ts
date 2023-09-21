import { Module } from '@nestjs/common';
import { H3DataController } from 'modules/h3-data/h3-data.controller';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { H3Data } from 'modules/h3-data/entities/h3-data.entity';
import { MaterialsModule } from 'modules/materials/materials.module';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { UnitConversionsModule } from 'modules/unit-conversions/unit-conversions.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { H3DataYearsService } from 'modules/h3-data/services/h3-data-years.service';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { H3DataMapService } from 'modules/h3-data/h3-data-map.service';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { MaterialsService } from 'modules/materials/materials.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { AuthorizationModule } from 'modules/authorization/authorization.module';
import { IndicatorMaterialToH3 } from 'modules/h3-data/entities/indicator-material-to-h3.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([H3Data, IndicatorMaterialToH3]),
    MaterialsModule,
    IndicatorsModule,
    UnitConversionsModule,
    SourcingRecordsModule,
    AdminRegionsModule,
    SuppliersModule,
    BusinessUnitsModule,
    SourcingLocationsModule,
    AuthorizationModule,
  ],
  controllers: [H3DataController],
  providers: [
    H3DataService,
    H3DataMapService,
    H3DataYearsService,
    H3DataRepository,
    MaterialsService,
  ],
  exports: [H3DataService, H3DataYearsService],
})
export class H3DataModule {}
