import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContextualLayerRepository } from 'modules/contextual-layers/contextual-layer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ContextualLayerRepository])],
})
export class ContextualLayersModule {}
