import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingLocationsController } from 'modules/sourcing-locations/sourcing-locations.controller';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { MaterialsFromSourcingLocationsService } from './materials-from-sourcing-locations.service';

@Module({
  imports: [TypeOrmModule.forFeature([SourcingLocationRepository])],
  controllers: [SourcingLocationsController],
  providers: [SourcingLocationsService, MaterialsFromSourcingLocationsService],
  exports: [SourcingLocationsService, MaterialsFromSourcingLocationsService],
})
export class SourcingLocationsModule {}
