import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRegionRepository } from 'modules/admin-regions/admin-region.repository';
import { AdminRegionsController } from 'modules/admin-regions/admin-regions.controller';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminRegionRepository])],
  controllers: [AdminRegionsController],
  providers: [AdminRegionsService],
  exports: [AdminRegionsService],
})
export class AdminRegionsModule {}
