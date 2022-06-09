import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { SourcingLocationsController } from 'modules/sourcing-locations/sourcing-locations.controller';
import { SourcingLocationsService } from 'modules/sourcing-locations/sourcing-locations.service';
import { SourcingLocationsMaterialsService } from 'modules/sourcing-locations/sourcing-locations-materials.service';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { MaterialsModule } from 'modules/materials/materials.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SourcingLocationRepository]),
    forwardRef(() => AdminRegionsModule),
    forwardRef(() => BusinessUnitsModule),
    forwardRef(() => SuppliersModule),
    forwardRef(() => MaterialsModule),
  ],
  controllers: [SourcingLocationsController],
  providers: [SourcingLocationsService, SourcingLocationsMaterialsService],
  exports: [SourcingLocationsService],
})
export class SourcingLocationsModule {}
