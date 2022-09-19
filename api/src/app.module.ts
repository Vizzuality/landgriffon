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
import { SourcingLocationGroupsModule } from 'modules/sourcing-location-groups/sourcing-location-groups.module';
import { ScenariosModule } from 'modules/scenarios/scenarios.module';
import { ScenarioInterventionsModule } from 'modules/scenario-interventions/scenario-interventions.module';
import { ImportDataModule } from 'modules/import-data/import-data.module';
import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';
import { GeoCodingModule } from 'modules/geo-coding/geo-coding.module';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { ImpactModule } from 'modules/impact/impact.module';
import { TasksModule } from 'modules/tasks/tasks.module';
import { TargetsModule } from 'modules/targets/targets.module';
import { CommandModule } from 'nestjs-command';
import { UrlParamsModule } from 'modules/url-params/url-params.module';
import { ContextualLayersModule } from 'modules/contextual-layers/contextual-layers.module';
import { CachedDataModule } from 'modules/cached-data/cached-data.module';
import * as config from 'config';

const queueConfig: any = config.get('queue');

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    BullModule.forRoot({
      redis: {
        host: queueConfig.host,
        port: queueConfig.port,
        db: queueConfig.database,
      },
      settings: { lockDuration: 10000000, maxStalledCount: 0 },
    }),
    AdminRegionsModule,
    AuthenticationModule,
    BusinessUnitsModule,
    GeoRegionsModule,
    IndicatorCoefficientsModule,
    IndicatorsModule,
    IndicatorRecordsModule,
    MaterialsModule,
    ScenariosModule,
    ScenarioInterventionsModule,
    SourcingLocationsModule,
    SourcingLocationGroupsModule,
    SourcingRecordsModule,
    SuppliersModule,
    TerminusModule,
    UnitConversionsModule,
    UnitsModule,
    UsersModule,
    ImportDataModule,
    H3DataModule,
    GeoCodingModule,
    ImpactModule,
    TasksModule,
    TargetsModule,
    CommandModule,
    UrlParamsModule,
    ContextualLayersModule,
    CachedDataModule,
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
