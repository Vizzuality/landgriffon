import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessUnitsRepository } from './business-units.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessUnitsRepository])],
})
export class BusinessUnitsModule {}
