import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingLocationGroup } from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { SourcingLocationGroupsController } from 'modules/sourcing-location-groups/sourcing-location-groups.controller';
import { SourcingLocationGroupsService } from 'modules/sourcing-location-groups/sourcing-location-groups.service';
import { SourcingLocationGroupRepository } from 'modules/sourcing-location-groups/sourcing-location-group.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SourcingLocationGroup])],
  controllers: [SourcingLocationGroupsController],
  providers: [SourcingLocationGroupsService, SourcingLocationGroupRepository],
  exports: [SourcingLocationGroupsService],
})
export class SourcingLocationGroupsModule {}
