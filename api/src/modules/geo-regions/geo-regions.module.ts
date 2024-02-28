import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoRegionsController } from 'modules/geo-regions/geo-regions.controller';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeoRegion]),
    AdminRegionsModule,
    MaterialsModule,
    SuppliersModule,
  ],
  controllers: [GeoRegionsController],
  providers: [GeoRegionsService, GeoRegionRepository],
  exports: [GeoRegionsService, GeoRegionRepository],
})
export class GeoRegionsModule {}
