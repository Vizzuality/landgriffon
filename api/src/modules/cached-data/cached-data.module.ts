import { Module } from '@nestjs/common';
import { CachedDataController } from 'modules/cached-data/cached-data.controller';
import { CachedDataService } from 'modules/cached-data/cached-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CachedData } from 'modules/cached-data/cached-data.entity';
import { CachedDataRepository } from 'modules/cached-data/cached-data.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CachedData])],
  controllers: [CachedDataController],
  providers: [CachedDataService, CachedDataRepository],
  exports: [CachedDataService],
})
export class CachedDataModule {}
