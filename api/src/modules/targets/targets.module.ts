import { Module } from '@nestjs/common';
import { TargetsController } from 'modules/targets/targets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Target } from 'modules/targets/target.entity';
import { TargetsService } from 'modules/targets/targets.service';
import { TargetsRepository } from 'modules/targets/targets.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Target])],
  controllers: [TargetsController],
  providers: [TargetsService, TargetsRepository],
  exports: [TargetsService],
})
export class TargetsModule {}
