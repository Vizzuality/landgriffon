import { Module } from '@nestjs/common';
import { TargetsController } from 'modules/targets/targets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetsRepository } from './targets.repository';
import { TargetsService } from './targets.service';

@Module({
  imports: [TypeOrmModule.forFeature([TargetsRepository])],
  controllers: [TargetsController],
  providers: [TargetsService],
  exports: [TargetsService],
})
export class TargetsModule {}
