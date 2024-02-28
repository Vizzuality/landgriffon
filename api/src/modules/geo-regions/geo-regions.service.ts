import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { GetSupplierByType } from '../suppliers/dto/get-supplier-by-type.dto';
import { Supplier } from '../suppliers/supplier.entity';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import { MaterialsService } from 'modules/materials/materials.service';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { GetEUDRGeoRegions } from './dto/get-geo-region.dto';

@Injectable()
export class GeoRegionsService extends AppBaseService<
  GeoRegion,
  CreateGeoRegionDto,
  UpdateGeoRegionDto,
  AppInfoDTO
> {
  constructor(
    protected readonly geoRegionRepository: GeoRegionRepository,
    private readonly adminRegionService: AdminRegionsService,
    private readonly materialsService: MaterialsService,
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

  async getGeoRegionById(id: string): Promise<GeoRegion> {
    const found: GeoRegion | null = await this.geoRegionRepository.findOneBy({
      id,
    });

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
  ): Promise<string> {
    const previouslyExistingGeoRegion: GeoRegion[] =
      await this.geoRegionRepository.getGeomRadiusByHashedName({
        lat: newGeoRegionValues.coordinates.lat,
        lng: newGeoRegionValues.coordinates.lng,
      });
    if (previouslyExistingGeoRegion.length) {
      return previouslyExistingGeoRegion[0].id;
    }
    return this.geoRegionRepository.saveGeoRegionAsRadius(newGeoRegionValues);
  }

  async saveGeoRegionAsPoint(
    newGeoRegionValues: LocationGeoRegionDto,
  ): Promise<string> {
    const previouslyExistingGeoRegion: GeoRegion[] =
      await this.geoRegionRepository.getGeomPointByHashedName({
        lat: newGeoRegionValues.coordinates.lat,
        lng: newGeoRegionValues.coordinates.lng,
      });
    if (previouslyExistingGeoRegion.length) {
      return previouslyExistingGeoRegion[0].id;
    }
    return this.geoRegionRepository.saveGeoRegionAsPoint(newGeoRegionValues);
  }

  async deleteGeoRegionsCreatedByUser(): Promise<void> {
    await this.geoRegionRepository.delete({ isCreatedByUser: true });
  }

  async getGeoRegionsFromSourcingLocations(
    options: GetEUDRGeoRegions,
  ): Promise<GeoRegion[]> {
    if (options.originIds) {
      options.originIds =
        await this.adminRegionService.getAdminRegionDescendants(
          options.originIds,
        );
    }
    if (options.materialIds) {
      options.materialIds = await this.materialsService.getMaterialsDescendants(
        options.materialIds,
      );
    }

    return this.geoRegionRepository.getGeoRegionsFromSourcingLocations(options);
  }
}
