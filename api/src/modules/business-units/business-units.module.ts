import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { BusinessUnitsController } from 'modules/business-units/business-units.controller';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessUnitRepository]),
    forwardRef(() => AdminRegionsModule),
    forwardRef(() => SuppliersModule),
    forwardRef(() => MaterialsModule),
  ],
  controllers: [BusinessUnitsController],
  providers: [BusinessUnitsService],
  exports: [BusinessUnitsService],
})
export class BusinessUnitsModule {}
