import { Module } from '@nestjs/common';
import { CachedDataController } from 'modules/cached-data/cached-data.controller';
import { CachedDataService } from 'modules/cached-data/cached-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CachedDataRepository } from 'modules/cached-data/cached-data.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CachedDataRepository])],
  controllers: [CachedDataController],
  providers: [CachedDataService],
  exports: [CachedDataService],
})
export class CachedDataModule {}
