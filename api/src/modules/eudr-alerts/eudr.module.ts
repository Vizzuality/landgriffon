import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EudrService } from 'modules/eudr-alerts/eudr.service';
import { EudrController } from 'modules/eudr-alerts/eudr.controller';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { GeoRegionsModule } from 'modules/geo-regions/geo-regions.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { AlertsRepository } from './alerts.repository';

@Module({
  imports: [
    HttpModule,
    MaterialsModule,
    SuppliersModule,
    GeoRegionsModule,
    AdminRegionsModule,
  ],
  providers: [EudrService, AlertsRepository],
  controllers: [EudrController],
})
export class EudrModule {}
