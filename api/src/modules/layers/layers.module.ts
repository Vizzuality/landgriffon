import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LayersRepository } from './layers.repository';

@Module({ imports: [TypeOrmModule.forFeature([LayersRepository])] })
export class LayersModule {}
