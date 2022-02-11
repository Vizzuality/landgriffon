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
import { Material } from 'modules/materials/material.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';

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

  /**
   * @description Retrieve Ids of all required Entities and its Parent's present in Sourcing-LocationsW
   */

  async getMaterialIdsAndParentIds(): Promise<string[]> {
    const materialIds: { materialId: string }[] =
      await this.sourcingLocationRepository
        .createQueryBuilder('sl')
        .select('m.id', 'materialId')
        .addSelect('m.parent')
        .distinct(true)
        .innerJoin(Material, 'm', 'sl.materialId = m.id')
        .getRawMany();

    return materialIds.map(
      (materialIdObject: { materialId: string }): string =>
        materialIdObject.materialId,
    );
  }

  async getAdminRegionIdsAndParentIds(): Promise<string[]> {
    const adminRegionIds: { adminRegionId: string }[] =
      await this.sourcingLocationRepository
        .createQueryBuilder('sl')
        .select('ar.id', 'adminRegionId')
        .addSelect('ar.parent')
        .distinct(true)
        .innerJoin(AdminRegion, 'ar', 'sl.adminRegionId = ar.id')
        .getRawMany();

    return adminRegionIds.map(
      (adminRegionObject: { adminRegionId: string }): string =>
        adminRegionObject.adminRegionId,
    );
  }

  async getSupplierIdsAndParentIds(): Promise<string[]> {
    const supplierIds: { supplierIds: string }[] =
      await this.sourcingLocationRepository
        .createQueryBuilder('sl')
        .select('supplier.id', 'supplierIds')
        .addSelect('supplier.parent')
        .distinct(true)
        .innerJoin(
          Supplier,
          'supplier',
          '(supplier.id = sl.t1SupplierId OR supplier.id = sl.producerId)',
        )
        .where('sl.t1SupplierId IS NOT NULL')
        .andWhere('sl.producerId IS NOT NULL')
        .getRawMany();

    return supplierIds.map(
      (supplierIds: { supplierIds: string }): string => supplierIds.supplierIds,
    );
  }
}
