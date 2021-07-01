import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitConversionRepository } from 'modules/unit-conversions/unit-conversion.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UnitConversionRepository])],
})
export class UnitConversionsModule {}
