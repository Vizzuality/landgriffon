import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitConversionRepository } from 'modules/unit-conversions/unit-conversion.repository';
import { UnitConversionsController } from 'modules/unit-conversions/unit-conversions.controller';
import { UnitConversionsService } from 'modules/unit-conversions/unit-conversions.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnitConversionRepository])],
  controllers: [UnitConversionsController],
  providers: [UnitConversionsService],
  exports: [UnitConversionsService],
})
export class UnitConversionsModule {}
