// supress typescript error
// eslint-disable-next-line @typescript-eslint/ban-types
// export type Type<T> = new (...args: any[]) => T;
// @ts-ignore-file
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import {
  EUDRAlertDatabaseResult,
  IEUDRAlertsRepository,
} from '../eudr.repositoty.interface';
import { SourcingLocation } from '../../sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { Material } from 'modules/materials/material.entity';
import { GetDashBoardDTO } from '../eudr.controller';
import { cloneDeep } from 'lodash';

type Entities = {
  supplierId: string;
  supplierName: string;
  companyId: string;
  adminRegionId: string;
  adminRegionName: string;
  materialId: string;
  materialName: string;
  totalBaselineVolume: number;
  geoRegionCount: number;
};

@Injectable()
export class EudrDashboardService {
  constructor(
    @Inject('IEUDRAlertsRepository')
    private readonly eudrRepository: IEUDRAlertsRepository,
    private readonly datasource: DataSource,
  ) {}

  async buildDashboard(dto: GetDashBoardDTO): Promise<any> {
    const alertSummary: EUDRAlertDatabaseResult[] =
      await this.eudrRepository.getAlertSummary({
        alertStartDate: dto.startAlertDate,
        alertEnDate: dto.endAlertDate,
        supplierIds: dto.producerIds,
      });
    const entities: Entities[] = await this.getEntities(dto);
    if (!entities) {
      throw new NotFoundException('Could not retrive data');
    }

    const alertData: EUDRAlertDatabaseResult[] = cloneDeep(alertSummary);
    const sourcingData: Entities[] = cloneDeep(entities);

    const materials: any = {
      'Deforestation-free suppliers': { totalPercentage: 0, detail: [] },
      'Suppliers with deforestation alerts': { totalPercentage: 0, detail: [] },
      'Suppliers with no location data': { totalPercentage: 0, detail: [] },
    };

    const origins: any = {
      'Deforestation-free suppliers': { totalPercentage: 0, detail: [] },
      'Suppliers with deforestation alerts': { totalPercentage: 0, detail: [] },
      'Suppliers with no location data': { totalPercentage: 0, detail: [] },
    };
    const transformed: any = alertSummary.reduce(
      (acc: any, cur: EUDRAlertDatabaseResult) => {
        acc[cur.supplierid] = {
          supplierid: cur.supplierid,
          dfs: cur.dfs,
          tpl: cur.tpl,
          sda: cur.sda,
        };
        return acc;
      },
      {},
    );

    const materialSuppliersMap: Map<string, any> = new Map();
    const originSuppliersMap: Map<string, any> = new Map();

    sourcingData.forEach(
      ({
        supplierId,
        materialId,
        materialName,
        geoRegionCount,
        adminRegionId,
        adminRegionName,
      }) => {
        if (!materialSuppliersMap.has(materialId)) {
          materialSuppliersMap.set(materialId, {
            materialName,
            suppliers: new Set(),
            zeroGeoRegionSuppliers: 0,
            dfsSuppliers: 0,
            sdaSuppliers: 0,
            tplSuppliers: 0,
          });
        }
        if (!originSuppliersMap.has(adminRegionId)) {
          originSuppliersMap.set(adminRegionId, {
            originName: adminRegionName,
            suppliers: new Set(),
            zeroGeoRegionSuppliers: 0,
            dfsSuppliers: 0,
            sdaSuppliers: 0,
            tplSuppliers: 0,
          });
        }
        const material: any = materialSuppliersMap.get(materialId);
        const origin: any = originSuppliersMap.get(adminRegionId);
        material.suppliers.add(supplierId);
        origin.suppliers.add(supplierId);
        if (geoRegionCount === 0) {
          material.zeroGeoRegionSuppliers += 1;
          origin.zeroGeoRegionSuppliers += 1;
        }
        if (transformed[supplierId].dfs > 0) {
          material.dfsSuppliers += 1;
          origin.dfsSuppliers += 1;
        }
        if (transformed[supplierId].sda > 0) {
          material.sdaSuppliers += 1;
          origin.sdaSuppliers += 1;
        }
        if (transformed[supplierId].tpl > 0) {
          material.tplSuppliers += 1;
          origin.tplSuppliers += 1;
        }
      },
    );
    materialSuppliersMap.forEach(
      (
        {
          materialName,
          suppliers,
          zeroGeoRegionSuppliers,
          dfsSuppliers,
          sdaSuppliers,
          tplSuppliers,
        },
        materialId: string,
      ) => {
        const noLocationPercentage: number =
          (zeroGeoRegionSuppliers / suppliers.size) * 100;
        materials['Suppliers with no location data'].detail.push({
          name: materialName,
          value: noLocationPercentage,
        });
        const dfsPercentage: number = (dfsSuppliers / suppliers.size) * 100;
        materials['Deforestation-free suppliers'].detail.push({
          name: materialName,
          value: dfsPercentage,
        });
        const sdaPercentage: number = (sdaSuppliers / suppliers.size) * 100;
        materials['Suppliers with deforestation alerts'].detail.push({
          name: materialName,
          value: sdaPercentage,
        });
      },
    );

    originSuppliersMap.forEach(
      (
        {
          originName,
          suppliers,
          zeroGeoRegionSuppliers,
          dfsSuppliers,
          sdaSuppliers,
          tplSuppliers,
        },
        adminRegionId: string,
      ) => {
        const noLocationPercentage: number =
          (zeroGeoRegionSuppliers / suppliers.size) * 100;
        origins['Suppliers with no location data'].detail.push({
          name: originName,
          value: noLocationPercentage,
        });
        const dfsPercentage: number = (dfsSuppliers / suppliers.size) * 100;
        origins['Deforestation-free suppliers'].detail.push({
          name: originName,
          value: dfsPercentage,
        });
        const sdaPercentage: number = (sdaSuppliers / suppliers.size) * 100;
        origins['Suppliers with deforestation alerts'].detail.push({
          name: originName,
          value: sdaPercentage,
        });
      },
    );

    materials['Suppliers with no location data'].totalPercentage =
      materials['Suppliers with no location data'].detail.reduce(
        (acc: number, cur: any) => acc + cur.value,
        0,
      ) / materials['Suppliers with no location data'].detail.length;

    materials['Deforestation-free suppliers'].totalPercentage =
      materials['Deforestation-free suppliers'].detail.reduce(
        (acc: number, cur: any) => acc + cur.value,
        0,
      ) / materials['Deforestation-free suppliers'].detail.length;

    materials['Suppliers with deforestation alerts'].totalPercentage =
      materials['Suppliers with deforestation alerts'].detail.reduce(
        (acc: number, cur: any) => acc + cur.value,
        0,
      ) / materials['Suppliers with deforestation alerts'].detail.length;

    origins['Suppliers with no location data'].totalPercentage =
      origins['Suppliers with no location data'].detail.reduce(
        (acc: number, cur: any) => acc + cur.value,
        0,
      ) / origins['Suppliers with no location data'].detail.length;

    origins['Deforestation-free suppliers'].totalPercentage =
      origins['Deforestation-free suppliers'].detail.reduce(
        (acc: number, cur: any) => acc + cur.value,
        0,
      ) / origins['Deforestation-free suppliers'].detail.length;

    origins['Suppliers with deforestation alerts'].totalPercentage =
      origins['Suppliers with deforestation alerts'].detail.reduce(
        (acc: number, cur: any) => acc + cur.value,
        0,
      ) / origins['Suppliers with deforestation alerts'].detail.length;

    const transformedEntities: any = entities.reduce(
      (acc: any, cur: Entities) => {
        acc[cur.supplierId] = { ...cur };
        return acc;
      },
      {},
    );

    const materialsBySupplier = new Map();
    const originsBySupplier = new Map();

    entities.forEach((entity) => {
      if (!materialsBySupplier.has(entity.supplierId)) {
        materialsBySupplier.set(entity.supplierId, []);
        originsBySupplier.set(entity.supplierId, []);
      }

      materialsBySupplier.get(entity.supplierId).push({
        materialName: entity.materialName,
        id: entity.materialId,
      });

      originsBySupplier.get(entity.supplierId).push({
        originName: entity.adminRegionName,
        id: entity.adminRegionId,
      });
    });

    const result: any = Object.keys(transformed).map((key: string) => {
      return {
        supplierId: key,
        supplierName: transformedEntities[key].supplierName,
        companyId: transformedEntities[key].companyId,
        baselineVolume: transformedEntities[key].totalBaselineVolume,
        dfs: transformed[key].dfs,
        sda: transformed[key].sda,
        tpl: transformed[key].tpl,
        materials: materialsBySupplier.get(key) || [],
        origins: originsBySupplier.get(key) || [],
      };
    });
    return {
      table: result,
      breakDown: { materials, origins },
    };
  }

  async getEntities(dto: GetDashBoardDTO): Promise<any> {
    const queryBuilder: SelectQueryBuilder<any> =
      this.datasource.createQueryBuilder();
    queryBuilder
      .select('s.id', 'supplierId')
      .addSelect('s.name', 'supplierName')
      .addSelect('s.companyId', 'companyId')
      .addSelect('m.id', 'materialId')
      .addSelect('m.name', 'materialName')
      .addSelect('ar.id', 'adminRegionId')
      .addSelect('ar.name', 'adminRegionName')
      .addSelect('SUM(sr.tonnage)', 'totalBaselineVolume')
      .addSelect('COUNT(sl.geoRegionId)', 'geoRegionsCount')
      .from(SourcingLocation, 'sl')
      .leftJoin(Supplier, 's', 's.id = sl.producerId')
      .leftJoin(AdminRegion, 'ar', 'ar.id = sl.adminRegionId')
      .leftJoin(Material, 'm', 'm.id = sl.materialId')
      .leftJoin(SourcingRecord, 'sr', 'sr.sourcingLocationId = sl.id')
      .where('sr.year = :year', { year: 2020 })
      .groupBy('s.id')
      .addGroupBy('m.id')
      .addGroupBy('ar.id');
    if (dto.producerIds) {
      queryBuilder.andWhere('s.id IN (:...producerIds)', {
        producerIds: dto.producerIds,
      });
    }
    if (dto.materialIds) {
      queryBuilder.andWhere('m.id IN (:...materialIds)', {
        materialIds: dto.materialIds,
      });
    }
    if (dto.originIds) {
      queryBuilder.andWhere('ar.id IN (:...originIds)', {
        originIds: dto.originIds,
      });
    }
    if (dto.geoRegionIds) {
      queryBuilder.andWhere('sl.geoRegionId IN (:...geoRegionIds)', {
        geoRegionIds: dto.geoRegionIds,
      });
    }

    return queryBuilder.getRawMany();
  }
}
