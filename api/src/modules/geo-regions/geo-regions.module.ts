import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoRegionsController } from 'modules/geo-regions/geo-regions.controller';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GeoRegion])],
  controllers: [GeoRegionsController],
  providers: [GeoRegionsService, GeoRegionRepository],
  exports: [GeoRegionsService, GeoRegionRepository],
})
export class GeoRegionsModule {}
