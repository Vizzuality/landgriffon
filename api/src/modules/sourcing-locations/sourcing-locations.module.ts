import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingLocationsController } from 'modules/sourcing-locations/sourcing-locations.controller';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingLocationsMaterialsService } from 'modules/sourcing-locations/sourcing-locations-materials.service';

@Module({
  imports: [TypeOrmModule.forFeature([SourcingLocationRepository])],
  controllers: [SourcingLocationsController],
  providers: [SourcingLocationsService, SourcingLocationsMaterialsService],
  exports: [SourcingLocationsService],
})
export class SourcingLocationsModule {}
