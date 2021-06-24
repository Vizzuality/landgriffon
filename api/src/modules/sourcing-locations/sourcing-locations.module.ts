import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingLocationsRepository } from './sourcing-locations.repository';

@Module({ imports: [TypeOrmModule.forFeature([SourcingLocationsRepository])] })
export class SourcingLocationsModule {}
