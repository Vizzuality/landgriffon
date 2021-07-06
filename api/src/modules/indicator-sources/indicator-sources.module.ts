import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicatorSourceRepository } from 'modules/indicator-sources/indicator-source.repository';
import { IndicatorSourcesController } from 'modules/indicator-sources/indicator-sources.controller';
import { IndicatorSourcesService } from 'modules/indicator-sources/indicator-sources.service';

@Module({
  imports: [TypeOrmModule.forFeature([IndicatorSourceRepository])],
  controllers: [IndicatorSourcesController],
  providers: [IndicatorSourcesService],
  exports: [IndicatorSourcesService],
})
export class IndicatorSourcesModule {}
