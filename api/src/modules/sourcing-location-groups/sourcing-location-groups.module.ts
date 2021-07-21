import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingLocationGroupRepository } from 'modules/sourcing-location-groups/sourcing-location-group.repository';
import { SourcingLocationGroupsController } from 'modules/sourcing-location-groups/sourcing-location-groups.controller';
import { SourcingLocationGroupsService } from 'modules/sourcing-location-groups/sourcing-location-groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([SourcingLocationGroupRepository])],
  controllers: [SourcingLocationGroupsController],
  providers: [SourcingLocationGroupsService],
  exports: [SourcingLocationGroupsService],
})
export class SourcingLocationGroupsModule {}
