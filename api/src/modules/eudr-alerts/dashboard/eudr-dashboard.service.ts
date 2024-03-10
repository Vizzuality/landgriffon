// supress typescript error
// eslint-disable-next-line @typescript-eslint/ban-types
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import {
  EUDRAlertDatabaseResult,
  IEUDRAlertsRepository,
} from 'modules/eudr-alerts/eudr.repositoty.interface';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { Supplier } from 'modules/suppliers/supplier.entity';
import { AdminRegion } from 'modules/admin-regions/admin-region.entity';
import { SourcingRecord } from 'modules/sourcing-records/sourcing-record.entity';
import { Material } from 'modules/materials/material.entity';
import { GetDashBoardDTO } from 'modules/eudr-alerts/eudr.controller';
import {
  DashBoardTableElements,
  EntityMetadata,
  EUDRBreakDown,
  EUDRDashboard,
  EUDRDashBoardFields,
} from 'modules/eudr-alerts/dashboard/types';

@Injectable()
export class EudrDashboardService {
  constructor(
    @Inject('IEUDRAlertsRepository')
    private readonly eudrRepository: IEUDRAlertsRepository,
    private readonly datasource: DataSource,
  ) {}

  async buildDashboard(dto: GetDashBoardDTO): Promise<EUDRDashboard> {
    const alertSummary: EUDRAlertDatabaseResult[] =
      await this.eudrRepository.getAlertSummary({
        alertStartDate: dto.startAlertDate,
        alertEnDate: dto.endAlertDate,
        supplierIds: dto.producerIds,
      });
    const entityMetadata: EntityMetadata[] = await this.getEntityMetadata(dto);
    if (!entityMetadata.length) {
      throw new NotFoundException(
        'Could not retrieve EUDR Data. Please contact the administrator',
      );
    }
    const materials: Record<
      EUDRDashBoardFields,
      { totalPercentage: number; detail: any[] }
    > = {
      [EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS]: {
        totalPercentage: 0,
        detail: [],
      },
      [EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS]: {
        totalPercentage: 0,
        detail: [],
      },
      [EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA]: {
        totalPercentage: 0,
        detail: [],
      },
    };

    const origins: Record<
      EUDRDashBoardFields,
      { totalPercentage: number; detail: any[] }
    > = {
      [EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS]: {
        totalPercentage: 0,
        detail: [],
      },
      [EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS]: {
        totalPercentage: 0,
        detail: [],
      },
      [EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA]: {
        totalPercentage: 0,
        detail: [],
      },
    };
    const alertMap: {
      [key: string]: {
        supplierId: string;
        dfs: number;
        tpl: number;
        sda: number;
      };
    } = alertSummary.reduce((acc: any, cur: EUDRAlertDatabaseResult) => {
      acc[cur.supplierid] = {
        supplierid: cur.supplierid,
        dfs: cur.dfs,
        tpl: cur.tpl,
        sda: cur.sda,
      };
      return acc;
    }, {});

    const entityMap: {
      [key: string]: {
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
    } = entityMetadata.reduce((acc: any, cur: EntityMetadata) => {
      acc[cur.supplierId] = { ...cur };
      return acc;
    }, {});

    const supplierToMaterials: Map<string, { name: string; id: string }[]> =
      new Map();
    const supplierToOriginis: Map<string, { name: string; id: string }[]> =
      new Map();
    const materialMap: Map<
      string,
      {
        materialName: string;
        suppliers: Set<string>;
        zeroGeoRegionSuppliers: number;
        dfsSuppliers: number;
        sdaSuppliers: number;
        tplSuppliers: number;
      }
    > = new Map();
    const originMap: Map<
      string,
      {
        originName: string;
        suppliers: Set<string>;
        zeroGeoRegionSuppliers: number;
        dfsSuppliers: number;
        sdaSuppliers: number;
        tplSuppliers: number;
      }
    > = new Map();

    entityMetadata.forEach((entity: EntityMetadata) => {
      const {
        materialId,
        supplierId,
        adminRegionId,
        materialName,
        adminRegionName,
        geoRegionCount,
      } = entity;
      if (!supplierToMaterials.has(entity.supplierId)) {
        supplierToMaterials.set(entity.supplierId, []);
        supplierToOriginis.set(entity.supplierId, []);
      }
      if (!materialMap.has(materialId)) {
        materialMap.set(materialId, {
          materialName,
          suppliers: new Set(),
          zeroGeoRegionSuppliers: 0,
          dfsSuppliers: 0,
          sdaSuppliers: 0,
          tplSuppliers: 0,
        });
      }
      if (!originMap.has(adminRegionId)) {
        originMap.set(adminRegionId, {
          originName: adminRegionName,
          suppliers: new Set(),
          zeroGeoRegionSuppliers: 0,
          dfsSuppliers: 0,
          sdaSuppliers: 0,
          tplSuppliers: 0,
        });
      }
      const material: any = materialMap.get(materialId);
      const origin: any = originMap.get(adminRegionId);
      material.suppliers.add(supplierId);
      origin.suppliers.add(supplierId);
      if (geoRegionCount === 0) {
        material.zeroGeoRegionSuppliers += 1;
        origin.zeroGeoRegionSuppliers += 1;
      }
      if (alertMap[supplierId].dfs > 0) {
        material.dfsSuppliers += 1;
        origin.dfsSuppliers += 1;
      }
      if (alertMap[supplierId].sda > 0) {
        material.sdaSuppliers += 1;
        origin.sdaSuppliers += 1;
      }
      if (alertMap[supplierId].tpl > 0) {
        material.tplSuppliers += 1;
        origin.tplSuppliers += 1;
      }

      supplierToMaterials.get(entity.supplierId)!.push({
        name: entity.materialName,
        id: entity.materialId,
      });

      supplierToOriginis.get(entity.supplierId)!.push({
        name: entity.adminRegionName,
        id: entity.adminRegionId,
      });
    });

    materialMap.forEach(
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

    originMap.forEach(
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
        origins[
          EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA
        ].detail.push({
          name: originName,
          value: noLocationPercentage,
        });
        const dfsPercentage: number = (dfsSuppliers / suppliers.size) * 100;
        origins[EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS].detail.push({
          name: originName,
          value: dfsPercentage,
        });
        const sdaPercentage: number = (sdaSuppliers / suppliers.size) * 100;
        origins[
          EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS
        ].detail.push({
          name: originName,
          value: sdaPercentage,
        });
      },
    );

    materials[
      EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA
    ].totalPercentage =
      materials[
        EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA
      ].detail.reduce((acc: number, cur: any) => acc + cur.value, 0) /
      materials[EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA].detail
        .length;

    materials[
      EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS
    ].totalPercentage =
      materials[EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS].detail.reduce(
        (acc: number, cur: any) => acc + cur.value,
        0,
      ) /
      materials[EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS].detail.length;

    materials[
      EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS
    ].totalPercentage =
      materials[
        EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS
      ].detail.reduce((acc: number, cur: any) => acc + cur.value, 0) /
      materials[EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS].detail
        .length;

    origins[
      EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA
    ].totalPercentage =
      origins[
        EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA
      ].detail.reduce((acc: number, cur: any) => acc + cur.value, 0) /
      origins[EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA].detail
        .length;

    origins[EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS].totalPercentage =
      origins[EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS].detail.reduce(
        (acc: number, cur: any) => acc + cur.value,
        0,
      ) /
      origins[EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS].detail.length;

    origins[
      EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS
    ].totalPercentage =
      origins[
        EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS
      ].detail.reduce((acc: number, cur: any) => acc + cur.value, 0) /
      origins[EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS].detail
        .length;

    const table: DashBoardTableElements[] = Object.keys(alertMap).map(
      (key: string) => {
        return {
          supplierId: key,
          supplierName: entityMap[key].supplierName,
          companyId: entityMap[key].companyId,
          baselineVolume: entityMap[key].totalBaselineVolume,
          dfs: alertMap[key].dfs,
          sda: alertMap[key].sda,
          tpl: alertMap[key].tpl,
          materials: supplierToMaterials.get(key) || [],
          origins: supplierToOriginis.get(key) || [],
        };
      },
    );

    return {
      table: table,
      breakDown: { materials, origins } as EUDRBreakDown,
    };
  }

  /**
   * @description: Retrieves entity related data with some Ids, so we can relate it to the data retrieved from Carto, and add the
   *               corresponding names to show in the dashboard.
   */

  async getEntityMetadata(dto: GetDashBoardDTO): Promise<any> {
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
