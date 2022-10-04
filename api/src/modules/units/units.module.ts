import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitRepository } from 'modules/units/unit.repository';
import { UnitsController } from 'modules/units/units.controller';
import { UnitsService } from 'modules/units/units.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnitRepository])],
  controllers: [UnitsController],
  providers: [UnitsService],
  exports: [UnitsService],
})
export class UnitsModule {}
