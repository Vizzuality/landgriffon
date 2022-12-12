import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { SuppliersController } from 'modules/suppliers/suppliers.controller';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier]),
    forwardRef(() => AdminRegionsModule),
    forwardRef(() => BusinessUnitsModule),
    forwardRef(() => MaterialsModule),
    forwardRef(() => SourcingLocationsModule),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService, SupplierRepository],
  exports: [SuppliersService],
})
export class SuppliersModule {}
