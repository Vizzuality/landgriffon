import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialRepository } from 'modules/materials/material.repository';
import { MaterialsController } from 'modules/materials/materials.controller';
import { MaterialsService } from 'modules/materials/materials.service';
import { MaterialsToH3sService } from 'modules/materials/materials-to-h3s.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaterialRepository, MaterialsToH3sService]),
    SourcingLocationsModule,
    forwardRef(() => AdminRegionsModule),
  ],
  controllers: [MaterialsController],
  providers: [MaterialsService],
  exports: [
    MaterialsService,
    TypeOrmModule.forFeature([MaterialsToH3sService]),
  ],
})
export class MaterialsModule {}
