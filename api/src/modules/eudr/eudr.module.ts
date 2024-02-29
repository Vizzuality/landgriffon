import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EudrService } from 'modules/eudr/eudr.service';
import { EudrController } from 'modules/eudr/eudr.controller';
import { CartodbRepository } from 'modules/eudr/carto/cartodb.repository';
import { CartoConnector } from './carto/carto.connector';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { GeoRegionsModule } from 'modules/geo-regions/geo-regions.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';

@Module({
  imports: [
    HttpModule,
    MaterialsModule,
    SuppliersModule,
    GeoRegionsModule,
    AdminRegionsModule,
  ],
  providers: [EudrService, CartodbRepository, CartoConnector],
  controllers: [EudrController],
})
export class EudrModule {}
