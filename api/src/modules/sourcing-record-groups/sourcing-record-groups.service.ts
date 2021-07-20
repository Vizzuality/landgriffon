import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  SourcingRecordGroup,
  sourcingRecordGroupResource,
} from 'modules/sourcing-record-groups/sourcing-record-group.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { SourcingRecordGroupRepository } from 'modules/sourcing-record-groups/sourcing-record-group.repository';
import { CreateSourcingRecordGroupDto } from 'modules/sourcing-record-groups/dto/create.sourcing-record-group.dto';
import { UpdateSourcingRecordGroupDto } from 'modules/sourcing-record-groups/dto/update.sourcing-record-group.dto';

@Injectable()
export class SourcingRecordGroupsService extends AppBaseService<
  SourcingRecordGroup,
  CreateSourcingRecordGroupDto,
  UpdateSourcingRecordGroupDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(SourcingRecordGroupRepository)
    protected readonly sourcingRecordGroupRepository: SourcingRecordGroupRepository,
  ) {
    super(
      sourcingRecordGroupRepository,
      sourcingRecordGroupResource.name.singular,
      sourcingRecordGroupResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<SourcingRecordGroup> {
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

  async getSourcingRecordGroupById(id: number): Promise<SourcingRecordGroup> {
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
