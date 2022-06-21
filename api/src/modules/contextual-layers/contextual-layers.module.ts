import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContextualLayerRepository } from 'modules/contextual-layers/contextual-layer.repository';
import { ContextualLayersController } from 'modules/contextual-layers/contextual-layers.controller';
import { ContextualLayersService } from 'modules/contextual-layers/contextual-layers.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContextualLayerRepository])],
  controllers: [ContextualLayersController],
  providers: [ContextualLayersService],
})
export class ContextualLayersModule {}
