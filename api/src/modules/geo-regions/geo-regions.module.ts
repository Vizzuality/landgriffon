import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeoRegionsRepository } from './geo-regions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GeoRegionsRepository])],
})
export class GeoRegionsModule {}
