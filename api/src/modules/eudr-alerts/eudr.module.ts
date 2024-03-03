import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EudrService } from 'modules/eudr-alerts/eudr.service';
import { EudrController } from 'modules/eudr-alerts/eudr.controller';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { GeoRegionsModule } from 'modules/geo-regions/geo-regions.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { AlertsRepository } from 'modules/eudr-alerts/alerts.repository';

export const IEUDRAlertsRepositoryToken = Symbol('IEUDRAlertsRepository');

// TODO: Use token injection and refer to the interface, right now I am having a dependencv issue
@Module({
  imports: [
    HttpModule,
    MaterialsModule,
    SuppliersModule,
    GeoRegionsModule,
    AdminRegionsModule,
  ],
  providers: [
    EudrService,
    AlertsRepository,
    { provide: IEUDRAlertsRepositoryToken, useClass: AlertsRepository },
  ],
  controllers: [EudrController],
  // exports: [IEUDRAlertsRepositoryToken],
})
export class EudrModule {}
