import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import {
  GeoRegion,
  geoRegionResource,
} from 'modules/geo-regions/geo-region.entity';
import { AppInfoDTO } from 'dto/info.dto';
import { GeoRegionRepository } from 'modules/geo-regions/geo-region.repository';
import { CreateGeoRegionDto } from 'modules/geo-regions/dto/create.geo-region.dto';
import { UpdateGeoRegionDto } from 'modules/geo-regions/dto/update.geo-region.dto';

@Injectable()
export class GeoRegionsService extends AppBaseService<
  GeoRegion,
  CreateGeoRegionDto,
  UpdateGeoRegionDto,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(GeoRegionRepository)
    protected readonly geoRegionRepository: GeoRegionRepository,
  ) {
    super(
      geoRegionRepository,
      geoRegionResource.name.singular,
      geoRegionResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<GeoRegion> {
    return {
      attributes: ['name'],
      keyForAttribute: 'camelCase',
    };
  }

  async getGeoRegionById(id: number): Promise<GeoRegion> {
    const found = await this.geoRegionRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`geo region with ID "${id}" not found`);
    }

    return found;
  }
}
