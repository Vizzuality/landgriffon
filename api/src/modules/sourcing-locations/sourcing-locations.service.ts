import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  SourcingLocation,
  sourcingLocationResource,
} from 'modules/sourcing-locations/sourcing-location.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { SourcingLocationRepository } from 'modules/sourcing-locations/sourcing-location.repository';
import { CreateSourcingLocationDto } from 'modules/sourcing-locations/dto/create.sourcing-location.dto';
import { UpdateSourcingLocationDto } from 'modules/sourcing-locations/dto/update.sourcing-location.dto';

@Injectable()
export class SourcingLocationsService extends AppBaseService<
  SourcingLocation,
  CreateSourcingLocationDto,
  UpdateSourcingLocationDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(SourcingLocationRepository)
    protected readonly sourcingLocationRepository: SourcingLocationRepository,
  ) {
    super(
      sourcingLocationRepository,
      sourcingLocationResource.name.singular,
      sourcingLocationResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<SourcingLocation> {
    return {
      attributes: [
        'title',
        'locationType',
        'locationAccuracy',
        'createdAt',
        'updatedAt',
        'metadata',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getSourcingLocationById(id: number): Promise<SourcingLocation> {
    const found = await this.sourcingLocationRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(
        `Sourcing location with ID "${id}" not found`,
      );
    }

    return found;
  }

  async clearTable(): Promise<void> {
    await this.sourcingLocationRepository.delete({});
  }

  async save(entityArray: any): Promise<any> {
    return await this.sourcingLocationRepository.save(entityArray);
  }
}
