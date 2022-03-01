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
import { LocationGeoRegionDto } from 'modules/geo-regions/dto/location.geo-region.dto';
import { QueryRunner } from 'typeorm';

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
    const found: GeoRegion | undefined = await this.geoRegionRepository.findOne(
      id,
    );

    if (!found) {
      throw new NotFoundException(`geo region with ID "${id}" not found`);
    }

    return found;
  }

  /**
   *
   * @param newGeoRegionValues
   * Creates a new geo-region row and generates a 50km radius as multipolygon geometry
   * by given coordinates
   *
   * @param queryRunner
   * @return generated geo-regions id
   */

  async saveGeoRegionAsRadius(
    newGeoRegionValues: LocationGeoRegionDto,
    queryRunner?: QueryRunner,
  ): Promise<GeoRegion> {
    return await this.geoRegionRepository.saveGeoRegionAsRadius(
      newGeoRegionValues,
      queryRunner,
    );
  }

  async saveGeoRegionAsPoint(
    newGeroRegionValues: LocationGeoRegionDto,
    queryRunner?: QueryRunner,
  ): Promise<Pick<GeoRegion, 'id'>> {
    return await this.geoRegionRepository.saveGeoRegionAsPoint(
      newGeroRegionValues,
      queryRunner,
    );
  }
}
