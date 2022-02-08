import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { AdminRegionsController } from 'modules/admin-regions/admin-regions.controller';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminRegionRepository]),
    SourcingLocationsModule,
  ],
  controllers: [AdminRegionsController],
  providers: [AdminRegionsService],
  exports: [AdminRegionsService],
})
export class AdminRegionsModule {}
