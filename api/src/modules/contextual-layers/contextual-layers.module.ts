import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContextualLayerRepository } from 'modules/contextual-layers/contextual-layer.repository';
import { ContextualLayersController } from 'modules/contextual-layers/contextual-layers.controller';
import { ContextualLayersService } from 'modules/contextual-layers/contextual-layers.service';
import { H3DataModule } from 'modules/h3-data/h3-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContextualLayerRepository]),
    H3DataModule,
  ],
  controllers: [ContextualLayersController],
  providers: [ContextualLayersService],
})
export class ContextualLayersModule {}
