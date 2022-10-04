import { Module } from '@nestjs/common';
import { TargetsController } from 'modules/targets/targets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetsRepository } from 'modules/targets/targets.repository';
import { TargetsService } from 'modules/targets/targets.service';

@Module({
  imports: [TypeOrmModule.forFeature([TargetsRepository])],
  controllers: [TargetsController],
  providers: [TargetsService],
  exports: [TargetsService],
})
export class TargetsModule {}
