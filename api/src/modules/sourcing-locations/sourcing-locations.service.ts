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
        'sourcingLocationGroupId',
        'sourcingLocationGroup',
        'createdAt',
        'updatedAt',
        'metadata',
      ],
      keyForAttribute: 'camelCase',
    };
  }

  async getSourcingLocationById(id: number): Promise<SourcingLocation> {
    const found: SourcingLocation | undefined =
      await this.sourcingLocationRepository.findOne(id);

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

  /**
   *
   * @debt Add proper input type when defined. Current workaround
   * 'SourcingData' mess with Entity typing
   */
  async save(
    sourcingLocationDTOs: CreateSourcingLocationDto[],
  ): Promise<SourcingLocation[]> {
    this.logger.log(`Saving ${sourcingLocationDTOs.length} nodes`);
    const sourcingLocation: SourcingLocation[] = await Promise.all(
      sourcingLocationDTOs.map(
        async (sourcingLocationDto: CreateSourcingLocationDto) => {
          return await this.setDataCreate(sourcingLocationDto);
        },
      ),
    );

    return await this.sourcingLocationRepository.save(sourcingLocation as any);
  }
}
