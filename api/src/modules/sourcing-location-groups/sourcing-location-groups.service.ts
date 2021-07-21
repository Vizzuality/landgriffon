import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  SourcingLocationGroup,
  sourcingRecordGroupResource,
} from 'modules/sourcing-location-groups/sourcing-location-group.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { SourcingLocationGroupRepository } from 'modules/sourcing-location-groups/sourcing-location-group.repository';
import { CreateSourcingLocationGroupDto } from 'modules/sourcing-location-groups/dto/create.sourcing-location-group.dto';
import { UpdateSourcingLocationGroupDto } from 'modules/sourcing-location-groups/dto/update.sourcing-location-group.dto';

@Injectable()
export class SourcingLocationGroupsService extends AppBaseService<
  SourcingLocationGroup,
  CreateSourcingLocationGroupDto,
  UpdateSourcingLocationGroupDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(SourcingLocationGroupRepository)
    protected readonly sourcingRecordGroupRepository: SourcingLocationGroupRepository,
  ) {
    super(
      sourcingRecordGroupRepository,
      sourcingRecordGroupResource.name.singular,
      sourcingRecordGroupResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<SourcingLocationGroup> {
    return {
      attributes: [
        'title',
        'description',
        'metadata',
        'createdAt',
        'updatedAt',
        'updatedById',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getSourcingRecordGroupById(id: number): Promise<SourcingLocationGroup> {
    const found = await this.sourcingRecordGroupRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(
        `Sourcing Record Group with ID "${id}" not found`,
      );
    }

    return found;
  }

  async clearTable(): Promise<void> {
    await this.sourcingRecordGroupRepository.delete({});
  }
}
