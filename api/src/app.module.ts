import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'typeorm.config';
import { AuthenticationModule } from 'modules/authentication/authentication.module';
import { UsersModule } from 'modules/users/users.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from 'filters/all-exceptions.exception.filter';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { LayersModule } from 'modules/layers/layers.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { GeoRegionsModule } from 'modules/geo-regions/geo-regions.module';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { IndicatorCoefficientsModule } from 'modules/indicator-coefficients/indicator-coefficients.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from 'health.controller';
import { UnitsModule } from 'modules/units/units.module';
import { UnitConversionsModule } from 'modules/unit-conversions/unit-conversions.module';
import { SourcingRecordGroupsModule } from 'modules/sourcing-record-groups/sourcing-record-groups.module';
import { IndicatorSourcesModule } from 'modules/indicator-sources/indicator-sources.module';
import { ScenariosModule } from 'modules/scenarios/scenarios.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AdminRegionsModule,
    AuthenticationModule,
    BusinessUnitsModule,
    GeoRegionsModule,
    IndicatorCoefficientsModule,
    IndicatorsModule,
    IndicatorSourcesModule,
    LayersModule,
    MaterialsModule,
    ScenariosModule,
    SourcingLocationsModule,
    SourcingRecordGroupsModule,
    SourcingRecordsModule,
    SuppliersModule,
    TerminusModule,
    UnitConversionsModule,
    UnitsModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [HealthController],
})
export class AppModule {}
