import { Inject, Injectable } from '@nestjs/common';
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

type Entities = {
  supplierId: string;
  supplierName: string;
  companyId: string;
  adminRegionId: string;
  adminRegionName: string;
  materialId: string;
  materialName: string;
  totalBaselineVolume: number;
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

    const entities: Entities[] = await this.getEntities(dto);

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
      breakDown: {},
    };
  }

  async getEntities(dto: any): Promise<any> {
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

    return queryBuilder.getRawMany();
  }
}
