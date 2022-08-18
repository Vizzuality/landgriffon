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
   * @return generated geo-regions id
   */

  async saveGeoRegionAsRadius(
    newGeoRegionValues: LocationGeoRegionDto,
  ): Promise<GeoRegion> {
    const previouslyExistingGeoRegion: GeoRegion | undefined =
      await this.geoRegionRepository.getGeomByHashedName({
        lat: newGeoRegionValues.coordinates.lat,
        lng: newGeoRegionValues.coordinates.lng,
      });
    if (previouslyExistingGeoRegion) {
      return previouslyExistingGeoRegion;
    }
    return this.geoRegionRepository.saveGeoRegionAsRadius(newGeoRegionValues);
  }

  async saveGeoRegionAsPoint(
    newGeoRegionValues: LocationGeoRegionDto,
  ): Promise<Pick<GeoRegion, 'id'>> {
    const previouslyExistingGeoRegion: GeoRegion | undefined =
      await this.geoRegionRepository.getGeomByHashedName({
        lat: newGeoRegionValues.coordinates.lat,
        lng: newGeoRegionValues.coordinates.lng,
      });
    if (previouslyExistingGeoRegion) {
      return previouslyExistingGeoRegion;
    }
    return this.geoRegionRepository.saveGeoRegionAsPoint(newGeoRegionValues);
  }

  async deleteGeoRegionsCreatedByUser(): Promise<void> {
    await this.geoRegionRepository.delete({ isCreatedByUser: true });
  }
}
