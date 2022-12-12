import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  SourcingLocationGroup,
  sourcingLocationGroupResource,
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
    protected readonly sourcingLocationGroupRepository: SourcingLocationGroupRepository,
  ) {
    super(
      sourcingLocationGroupRepository,
      sourcingLocationGroupResource.name.singular,
      sourcingLocationGroupResource.name.plural,
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

  async getSourcingLocationGroupById(
    id: string,
  ): Promise<SourcingLocationGroup> {
    const found: SourcingLocationGroup | null =
      await this.sourcingLocationGroupRepository.findOne({ where: { id } });

    if (!found) {
      throw new NotFoundException(
        `Sourcing Location Group with ID "${id}" not found`,
      );
    }

    return found;
  }

  async clearTable(): Promise<void> {
    await this.sourcingLocationGroupRepository.delete({});
  }
}
