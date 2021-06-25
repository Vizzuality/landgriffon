import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LayerRepository } from 'modules/layers/layer.repository';
import { LayersController } from 'modules/layers/layers.controller';
import { LayersService } from 'modules/layers/layers.service';

@Module({
  imports: [TypeOrmModule.forFeature([LayerRepository])],
  controllers: [LayersController],
  providers: [LayersService],
  exports: [LayersService],
})
export class LayersModule {}
