import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingRecordGroupRepository } from 'modules/sourcing-record-groups/sourcing-record-group.repository';
import { SourcingRecordGroupsController } from 'modules/sourcing-record-groups/sourcing-record-groups.controller';
import { SourcingRecordGroupsService } from 'modules/sourcing-record-groups/sourcing-record-groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([SourcingRecordGroupRepository])],
  controllers: [SourcingRecordGroupsController],
  providers: [SourcingRecordGroupsService],
  exports: [SourcingRecordGroupsService],
})
export class SourcingRecordGroupsModule {}
