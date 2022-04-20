import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { AdminRegionsController } from 'modules/admin-regions/admin-regions.controller';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminRegionRepository]),
    SourcingLocationsModule,
    forwardRef(() => MaterialsModule),
    SuppliersModule,
    BusinessUnitsModule,
  ],
  controllers: [AdminRegionsController],
  providers: [AdminRegionsService],
  exports: [AdminRegionsService],
})
export class AdminRegionsModule {}
