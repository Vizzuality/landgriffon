import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRegionsRepository } from './admin-regions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AdminRegionsRepository])],
})
export class AdminRegionsModule {}
