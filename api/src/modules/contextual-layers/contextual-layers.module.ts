import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContextualLayer } from 'modules/contextual-layers/contextual-layer.entity';
import { ContextualLayersController } from 'modules/contextual-layers/contextual-layers.controller';
import { ContextualLayersService } from 'modules/contextual-layers/contextual-layers.service';
import { H3DataModule } from 'modules/h3-data/h3-data.module';
import { ContextualLayerRepository } from 'modules/contextual-layers/contextual-layer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ContextualLayer]), H3DataModule],
  controllers: [ContextualLayersController],
  providers: [ContextualLayersService, ContextualLayerRepository],
})
export class ContextualLayersModule {}
