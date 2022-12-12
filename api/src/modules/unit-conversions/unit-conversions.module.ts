import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitConversion } from 'modules/unit-conversions/unit-conversion.entity';
import { UnitConversionsController } from 'modules/unit-conversions/unit-conversions.controller';
import { UnitConversionsService } from 'modules/unit-conversions/unit-conversions.service';
import { UnitConversionRepository } from 'modules/unit-conversions/unit-conversion.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UnitConversion])],
  controllers: [UnitConversionsController],
  providers: [UnitConversionsService, UnitConversionRepository],
  exports: [UnitConversionsService],
})
export class UnitConversionsModule {}
