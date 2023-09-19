import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from 'modules/materials/material.entity';
import { MaterialsController } from 'modules/materials/materials.controller';
import { MaterialsService } from 'modules/materials/materials.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { MaterialsToH3sService } from 'modules/h3-data/materials-to-h3s.service';
import { MaterialRepository } from 'modules/materials/material.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material]),
    forwardRef(() => AdminRegionsModule),
    forwardRef(() => BusinessUnitsModule),
    forwardRef(() => SuppliersModule),
    forwardRef(() => SourcingLocationsModule),
  ],
  controllers: [MaterialsController],
  providers: [MaterialsService, MaterialsToH3sService, MaterialRepository],
  exports: [MaterialsService, MaterialsToH3sService, MaterialRepository],
})
export class MaterialsModule {}
