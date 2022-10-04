import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { GeoRegionsController } from 'modules/geo-regions/geo-regions.controller';
import { GeoRegionsService } from 'modules/geo-regions/geo-regions.service';

@Module({
  imports: [TypeOrmModule.forFeature([GeoRegionRepository])],
  controllers: [GeoRegionsController],
  providers: [GeoRegionsService],
  exports: [GeoRegionsService],
})
export class GeoRegionsModule {}
