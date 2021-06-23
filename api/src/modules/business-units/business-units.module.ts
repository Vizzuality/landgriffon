import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessUnitRepository } from 'modules/business-units/business-unit.repository';
import { BusinessUnitsController } from 'modules/business-units/business-units.controller';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessUnitRepository])],
  controllers: [BusinessUnitsController],
  providers: [BusinessUnitsService],
  exports: [BusinessUnitsService],
})
export class BusinessUnitsModule {}
