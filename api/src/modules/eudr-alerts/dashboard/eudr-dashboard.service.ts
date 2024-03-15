import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm';
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
} from 'modules/eudr-alerts/dashboard/dashboard.types';
import { GetEUDRAlertDatesDto } from 'modules/eudr-alerts/dto/get-alerts.dto';
import { AlertsOutput } from 'modules/eudr-alerts/dto/alerts-output.dto';
import { GeoRegion } from 'modules/geo-regions/geo-region.entity';
import { EUDRDashBoardDetail } from 'modules/eudr-alerts/dashboard/dashboard-detail.types';
import { MaterialsService } from 'modules/materials/materials.service';
import { AdminRegionsService } from 'modules/admin-regions/admin-regions.service';
import {
  groupAlertsByDate,
  aggregateAndCalculatePercentage,
} from './dashboard-utils';

@Injectable()
export class EudrDashboardService {
  constructor(
    @Inject('IEUDRAlertsRepository')
    private readonly eudrRepository: IEUDRAlertsRepository,
    private readonly datasource: DataSource,
    private readonly materialsService: MaterialsService,
    private readonly adminRegionService: AdminRegionsService,
  ) {}

  async buildDashboard(dto: GetDashBoardDTO): Promise<EUDRDashboard> {
    if (dto.originIds) {
      dto.originIds = await this.adminRegionService.getAdminRegionDescendants(
        dto.originIds,
      );
    }
    if (dto.materialIds) {
      dto.materialIds = await this.materialsService.getMaterialsDescendants(
        dto.materialIds,
      );
    }

    const entityMetadata: EntityMetadata[] = await this.getEntityMetadata(dto);
    if (!entityMetadata.length) {
      throw new NotFoundException(
        'Could not retrieve EUDR Data. Please contact the administrator',
      );
    }

    const alertSummary: EUDRAlertDatabaseResult[] =
      await this.eudrRepository.getAlertSummary({
        alertStartDate: dto.startAlertDate,
        alertEnDate: dto.endAlertDate,
        supplierIds: entityMetadata.map(
          (entity: EntityMetadata) => entity.supplierId,
        ),
      });

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
        sda: cur.sda,
      };
      return acc;
    }, {});

    const entityMap: {
      [key: string]: {
        supplierId: string;
        supplierName: string;
        companyId: string;
        materialId: string;
        materialName: string;
        adminRegionId: string;
        adminRegionName: string;
        totalBaselineVolume: number;
        knownGeoRegions: number;
        totalSourcingLocations: number;
        isoA3: string;
      };
    } = entityMetadata.reduce((acc: any, cur: EntityMetadata) => {
      acc[cur.supplierId] = { ...cur };
      return acc;
    }, {});

    const supplierToMaterials: Map<string, { name: string; id: string }[]> =
      new Map();
    const supplierToOriginis: Map<
      string,
      { name: string; id: string; isoA3: string }[]
    > = new Map();
    const materialMap: Map<
      string,
      {
        materialName: string;
        suppliers: Set<string>;
        dfsSuppliers: number;
        sdaSuppliers: number;
        totalSourcingLocations: number;
        knownGeoRegions: number;
      }
    > = new Map();
    const originMap: Map<
      string,
      {
        originName: string;
        suppliers: Set<string>;
        dfsSuppliers: number;
        sdaSuppliers: number;
        totalSourcingLocations: number;
        knownGeoRegions: number;
        isoA3: string;
      }
    > = new Map();

    entityMetadata.forEach((entity: EntityMetadata) => {
      const {
        materialId,
        supplierId,
        adminRegionId,
        materialName,
        adminRegionName,
        knownGeoRegions,
        totalSourcingLocations,
        isoA3,
      } = entity;

      const unknownGeoRegions: number =
        totalSourcingLocations - knownGeoRegions;
      const tplPercentage: number =
        (unknownGeoRegions / totalSourcingLocations) * 100;

      if (alertMap[supplierId]) {
        alertMap[supplierId].tpl = tplPercentage;
      } else {
        alertMap[supplierId] = {
          supplierId,
          dfs: 0,
          sda: 0,
          tpl: tplPercentage,
        };
      }

      if (!supplierToMaterials.has(supplierId)) {
        supplierToMaterials.set(supplierId, []);
      }
      if (!supplierToOriginis.has(supplierId)) {
        supplierToOriginis.set(supplierId, []);
      }

      if (!materialMap.has(materialId)) {
        materialMap.set(materialId, {
          materialName,
          suppliers: new Set(),
          dfsSuppliers: 0,
          sdaSuppliers: 0,
          totalSourcingLocations: 0,
          knownGeoRegions: 0,
        });
      }
      if (!originMap.has(adminRegionId)) {
        originMap.set(adminRegionId, {
          originName: adminRegionName,
          isoA3: isoA3,
          suppliers: new Set(),
          dfsSuppliers: 0,
          sdaSuppliers: 0,
          totalSourcingLocations: 0,
          knownGeoRegions: 0,
        });
      }

      const material: any = materialMap.get(materialId);
      const origin: any = originMap.get(adminRegionId);
      material.suppliers.add(supplierId);
      material.totalSourcingLocations += totalSourcingLocations;
      material.knownGeoRegions += knownGeoRegions;
      origin.suppliers.add(supplierId);
      origin.totalSourcingLocations += totalSourcingLocations;
      origin.knownGeoRegions += knownGeoRegions;

      const alertData: any = alertMap[supplierId];
      if (alertData) {
        if (alertData.dfs > 0) {
          material.dfsSuppliers += 1;
          origin.dfsSuppliers += 1;
        }
        if (alertData.sda > 0) {
          material.sdaSuppliers += 1;
          origin.sdaSuppliers += 1;
        }
      }

      // Añadir detalles de material y región al supplier
      supplierToMaterials.get(supplierId)!.push({
        name: materialName,
        id: materialId,
      });
      supplierToOriginis.get(supplierId)!.push({
        name: adminRegionName,
        id: adminRegionId,
        isoA3: isoA3,
      });
    });

    materialMap.forEach(
      (
        {
          materialName,
          suppliers,
          totalSourcingLocations,
          knownGeoRegions,
          dfsSuppliers,
          sdaSuppliers,
        },
        materialId: string,
      ) => {
        const tplPercentage: number =
          ((totalSourcingLocations - knownGeoRegions) / suppliers.size) * 100;
        materials['Suppliers with no location data'].detail.push({
          name: materialName,
          value: tplPercentage,
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
          totalSourcingLocations,
          knownGeoRegions,
          dfsSuppliers,
          sdaSuppliers,
          isoA3,
        },
        adminRegionId: string,
      ) => {
        const tplPercentage: number =
          ((totalSourcingLocations - knownGeoRegions) / suppliers.size) * 100;
        origins[
          EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA
        ].detail.push({
          name: originName,
          value: tplPercentage,
          isoA3,
        });
        const dfsPercentage: number = (dfsSuppliers / suppliers.size) * 100;
        origins[EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS].detail.push({
          name: originName,
          value: dfsPercentage,
          isoA3,
        });
        const sdaPercentage: number = (sdaSuppliers / suppliers.size) * 100;
        origins[
          EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS
        ].detail.push({
          name: originName,
          value: sdaPercentage,
          isoA3,
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

  async getEntityMetadata(dto: GetDashBoardDTO): Promise<EntityMetadata[]> {
    const queryBuilder: SelectQueryBuilder<EntityMetadata> =
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
      .addSelect('COUNT(sl.geoRegionId)', 'knownGeoRegions')
      .addSelect('COUNT(sl.id)', 'totalSourcingLocations')
      .addSelect('ar.isoA3', 'isoA3')
      .from(SourcingLocation, 'sl')
      .leftJoin(Supplier, 's', 's.id = sl.producerId')
      .leftJoin(AdminRegion, 'ar', 'ar.name = sl.locationCountryInput')
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

  async buildDashboardDetail(
    supplierId: string,
    dto?: GetEUDRAlertDatesDto,
  ): Promise<EUDRDashBoardDetail> {
    const result: any = {};
    const sourcingInformation: any = {};
    let supplier: Supplier;
    const geoRegionMap: Map<string, { plotName: string }> = new Map();

    return this.datasource.transaction(async (manager: EntityManager) => {
      supplier = await manager
        .getRepository(Supplier)
        .findOneOrFail({ where: { id: supplierId } });
      result.name = supplier.name;
      result.address = supplier.address;
      result.companyId = supplier.companyId;
      result.sourcingInformation = sourcingInformation;
      const sourcingData: {
        materialId: string;
        materialName: string;
        hsCode: string;
        countryName: string;
        plotName: string;
        geoRegionId: string;
        plotArea: number;
        volume: number;
        year: number;
        sourcingLocationId: string;
      }[] = await manager
        .createQueryBuilder(SourcingLocation, 'sl')
        .select('m.name', 'materialName')
        .addSelect('sl.locationCountryInput', 'countryName')
        .addSelect('m.hsCodeId', 'hsCode')
        .addSelect('m.id', 'materialId')
        .leftJoin(Material, 'm', 'm.id = sl.materialId')
        .where('sl.producerId = :producerId', { producerId: supplierId })
        .distinct(true)
        .getRawMany();

      // TODO: we are assuming that each suppliers supplies only one material and for the same country

      const country: AdminRegion = await manager
        .getRepository(AdminRegion)
        .findOneOrFail({
          where: { name: sourcingData[0].countryName, level: 0 },
        });

      sourcingInformation.materialName = sourcingData[0].materialName;
      sourcingInformation.hsCode = sourcingData[0].hsCode;
      sourcingInformation.country = {
        name: country.name,
        isoA3: country.isoA3,
      };

      for (const material of sourcingData) {
        const geoRegions: any[] = await manager
          .createQueryBuilder(SourcingLocation, 'sl')
          .select('gr.id', 'geoRegionId')
          .addSelect('gr.name', 'plotName')
          .addSelect('gr.totalArea', 'totalArea')
          .distinct(true)
          .leftJoin(GeoRegion, 'gr', 'gr.id = sl.geoRegionId')
          .where('sl.materialId = :materialId', {
            materialId: material.materialId,
          })
          .andWhere('sl.producerId = :supplierId', { supplierId })
          .getRawMany();

        const sourcingRecords: {
          year: number;
          volume: number;
          plotName: string;
          geoRegionId: string;
        }[] = [];
        for (const geoRegion of geoRegions) {
          geoRegion.geoRegionId = geoRegion.geoRegionId ?? null;
          geoRegion.plotName = geoRegion.plotName ?? 'Unknown';
          if (!geoRegionMap.get(geoRegion.geoRegionId)) {
            geoRegionMap.set(geoRegion.geoRegionId, {
              plotName: geoRegion.plotName,
            });
          }
          const queryBuilder: SelectQueryBuilder<any> = manager
            .createQueryBuilder(SourcingRecord, 'sr')
            .leftJoin(SourcingLocation, 'sl', 'sr.sourcingLocationId = sl.id')
            .leftJoin(GeoRegion, 'gr', 'gr.id = sl.geoRegionId');
          if (!geoRegion.geoRegionId) {
            queryBuilder.andWhere('sl.geoRegionId IS NULL');
          } else {
            queryBuilder.andWhere('sl.geoRegionId = :geoRegionId', {
              geoRegionId: geoRegion.geoRegionId,
            });
          }
          queryBuilder
            .andWhere('sl.producerId = :supplierId', { supplierId: supplierId })
            .andWhere('sl.materialId = :materialId', {
              materialId: material.materialId,
            })
            .select([
              'sr.year AS year',
              'sr.tonnage AS volume',
              'gr.name as "plotName"',
              'gr.id as "geoRegionId"',
            ]);

          const newSourcingRecords: {
            year: number;
            volume: number;
            plotName: string;
            geoRegionId: string;
          }[] = await queryBuilder.getRawMany();

          sourcingRecords.push(...newSourcingRecords);
        }

        const totalVolume: number = sourcingRecords.reduce(
          (acc: number, cur: any) => acc + parseFloat(cur.volume),
          0,
        );
        const totalArea: number = geoRegions.reduce(
          (acc: number, cur: any) => acc + parseFloat(cur.totalArea ?? 0),
          0,
        );

        sourcingInformation.totalArea = totalArea;
        sourcingInformation.totalVolume = totalVolume;
        sourcingInformation.byArea = geoRegions.map((geoRegion: any) => ({
          plotName: geoRegion.plotName,
          geoRegionId: geoRegion.geoRegionId,
          percentage: (geoRegion.totalArea / totalArea) * 100,
          area: geoRegion.totalArea,
        }));

        sourcingInformation.byVolume =
          aggregateAndCalculatePercentage(sourcingRecords);
      }

      const alertsOutput: AlertsOutput[] = await this.eudrRepository.getAlerts({
        supplierIds: [supplierId],
        startAlertDate: dto?.startAlertDate,
        endAlertDate: dto?.endAlertDate,
      });

      const totalAlerts: number = alertsOutput.reduce(
        (acc: number, cur: AlertsOutput) => acc + cur.alertCount,
        0,
      );
      const startAlertDate: string | null =
        alertsOutput[0]?.alertDate?.value.toString() || null;
      const endAlertDate: string | null =
        alertsOutput[alertsOutput.length - 1]?.alertDate?.value.toString() ||
        null;

      const alerts = {
        startAlertDate: startAlertDate,
        endAlertDate: endAlertDate,
        totalAlerts,
        values: groupAlertsByDate(alertsOutput, geoRegionMap),
      };

      result.alerts = alerts;

      return result;
    });
  }
}
