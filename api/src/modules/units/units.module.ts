import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from 'modules/units/unit.entity';
import { UnitsController } from 'modules/units/units.controller';
import { UnitsService } from 'modules/units/units.service';
import { UnitRepository } from 'modules/units/unit.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  controllers: [UnitsController],
  providers: [UnitsService, UnitRepository],
  exports: [UnitsService],
})
export class UnitsModule {}
