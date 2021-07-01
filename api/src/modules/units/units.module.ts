import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitRepository } from 'modules/units/unit.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UnitRepository])],
})
export class UnitsModule {}
