import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { AdminRegionsController } from 'modules/admin-regions/admin-regions.controller';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminRegion]),
    forwardRef(() => MaterialsModule),
    forwardRef(() => SuppliersModule),
    forwardRef(() => BusinessUnitsModule),
    forwardRef(() => SourcingLocationsModule),
  ],
  controllers: [AdminRegionsController],
  providers: [AdminRegionsService, AdminRegionRepository],
  exports: [AdminRegionsService, AdminRegionRepository],
})
export class AdminRegionsModule {}
