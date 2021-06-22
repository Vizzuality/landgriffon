import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialsRepository } from './materials.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialsRepository])],
})
export class MaterialsModule {}
