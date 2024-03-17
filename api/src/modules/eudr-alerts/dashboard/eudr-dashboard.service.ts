import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, SelectQueryBuilder } from 'typeorm';
import {
  AlertedGeoregionsBySupplier,
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

    const materials: Record<any, { totalPercentage: number; detail: any[] }> = {
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

    const origins: Record<any, { totalPercentage: number; detail: any[] }> = {
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

    const entityMetadata: EntityMetadata[] = await this.getEntityMetadata(dto);
    if (!entityMetadata.length) {
      throw new NotFoundException(
        'Could not retrieve EUDR Data. Please contact the administrator',
      );
    }

    const alerts: AlertedGeoregionsBySupplier[] =
      await this.eudrRepository.getAlertedGeoRegionsBySupplier({
        startAlertDate: dto.startAlertDate,
        endAlertDate: dto.endAlertDate,
        supplierIds: entityMetadata.map(
          (entity: EntityMetadata) => entity.supplierId,
        ),
      });

    const alertMap = new Map<string, Set<string>>();

    alerts.forEach((alert: AlertedGeoregionsBySupplier) => {
      const { supplierId, geoRegionId } = alert;

      if (!alertMap.has(supplierId)) {
        alertMap.set(supplierId, new Set());
      }

      // @ts-ignore
      alertMap.get(supplierId).add(geoRegionId);
    });

    const suppliersMap = new Map<string, any>();
    const materialsMap = new Map<string, any>();
    const originsMap = new Map<string, any>();

    entityMetadata.forEach((entity) => {
      const {
        supplierId,
        materialId,
        adminRegionId,
        totalSourcingLocations,
        knownGeoRegions,
        supplierName,
        companyId,
        materialName,
        adminRegionName,
        totalBaselineVolume,
        isoA3,
      } = entity;

      const alertedGeoRegionsCount = alertMap.get(supplierId)?.size || 0;
      const nonAlertedGeoRegions =
        parseInt(String(totalSourcingLocations)) -
        parseInt(String(alertedGeoRegionsCount));
      const unknownGeoRegions =
        parseInt(String(totalSourcingLocations)) -
        parseInt(String(knownGeoRegions));

      const sdaPercentage =
        (alertedGeoRegionsCount / totalSourcingLocations) * 100;
      const tplPercentage = (unknownGeoRegions / totalSourcingLocations) * 100;
      const dfsPercentage =
        100 - (sdaPercentage + tplPercentage) > 0
          ? 100 - (sdaPercentage + tplPercentage)
          : 0;

      if (!suppliersMap.has(supplierId)) {
        suppliersMap.set(supplierId, {
          supplierId,
          supplierName,
          companyId,
          materials: [],
          origins: [],
          totalBaselineVolume: 0,
          dfs: 0,
          sda: 0,
          tpl: 0,
        });
      }
      const supplier = suppliersMap.get(supplierId);
      supplier.totalBaselineVolume = totalBaselineVolume;
      supplier.dfs = dfsPercentage;
      supplier.sda = sdaPercentage;
      supplier.tpl = tplPercentage;
      supplier.materials.push({ id: materialId, name: materialName });
      supplier.origins.push({
        id: adminRegionId,
        name: adminRegionName,
        isoA3: isoA3,
      });

      if (!materialsMap.has(materialId)) {
        materialsMap.set(materialId, {
          materialId,
          materialName,
          suppliers: new Set(),
          totalSourcingLocations: 0,
          knownGeoRegions: 0,
          alertedGeoRegions: 0,
        });
      }
      const material = materialsMap.get(materialId);
      material.suppliers.add(supplierId);
      material.totalSourcingLocations += parseFloat(
        String(totalSourcingLocations),
      );
      material.knownGeoRegions += parseInt(String(knownGeoRegions));
      material.alertedGeoRegions += alertMap.get(supplierId)?.size || 0;

      if (!originsMap.has(adminRegionId)) {
        originsMap.set(adminRegionId, {
          adminRegionId,
          adminRegionName,
          isoA3,
          suppliers: new Set(),
          totalSourcingLocations: 0,
          knownGeoRegions: 0,
          alertedGeoRegions: 0,
        });
      }
      const origin = originsMap.get(adminRegionId);
      origin.suppliers.add(supplierId);
      origin.totalSourcingLocations += parseInt(String(totalSourcingLocations));
      origin.knownGeoRegions += parseInt(String(knownGeoRegions));
      origin.alertedGeoRegions += alertMap.get(supplierId)?.size || 0;
    });

    materialsMap.forEach((material, materialId) => {
      const {
        materialName,
        totalSourcingLocations,
        knownGeoRegions,
        alertedGeoRegions,
      } = material;
      const nonAlertedGeoRegions = knownGeoRegions - alertedGeoRegions;
      const unknownGeoRegions = totalSourcingLocations - knownGeoRegions;

      const sdaPercentage = (alertedGeoRegions / totalSourcingLocations) * 100;
      const tplPercentage = (unknownGeoRegions / totalSourcingLocations) * 100;
      const dfsPercentage =
        100 - (sdaPercentage + tplPercentage) > 0
          ? 100 - (sdaPercentage + tplPercentage)
          : 0;

      materials[EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS].detail.push({
        name: materialName,
        id: materialId,
        value: dfsPercentage,
      });
      materials[
        EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS
      ].detail.push({
        name: materialName,
        id: materialId,
        value: sdaPercentage,
      });
      materials[
        EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA
      ].detail.push({
        name: materialName,
        id: materialId,
        value: tplPercentage,
      });
    });

    // @ts-ignore
    Object.keys(materials).forEach((key: EUDRDashBoardFields) => {
      const totalPercentage: number =
        materials[key].detail.reduce(
          (acc: number, cur: any) => acc + cur.value,
          0,
        ) / materials[key].detail.length;
      materials[key].totalPercentage = totalPercentage;
    });

    originsMap.forEach((origin, adminRegionId) => {
      const {
        adminRegionName,
        isoA3,
        totalSourcingLocations,
        knownGeoRegions,
        alertedGeoRegions,
      } = origin;
      const nonAlertedGeoRegions = knownGeoRegions - alertedGeoRegions;
      const unknownGeoRegions = totalSourcingLocations - knownGeoRegions;

      const sdaPercentage = (alertedGeoRegions / totalSourcingLocations) * 100;
      const tplPercentage = (unknownGeoRegions / totalSourcingLocations) * 100;
      const dfsPercentage =
        100 - (sdaPercentage + tplPercentage) > 0
          ? 100 - (sdaPercentage + tplPercentage)
          : 0;

      origins[EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS].detail.push({
        name: adminRegionName,
        id: adminRegionId,
        isoA3: isoA3,
        value: dfsPercentage,
      });
      origins[
        EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS
      ].detail.push({
        name: adminRegionName,
        id: adminRegionId,
        isoA3: isoA3,
        value: sdaPercentage,
      });
      origins[EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA].detail.push({
        name: adminRegionName,
        id: adminRegionId,
        isoA3: isoA3,
        value: tplPercentage,
      });
    });

    // @ts-ignore
    Object.keys(origins).forEach((key: EUDRDashBoardFields) => {
      const totalPercentage: number =
        origins[key].detail.reduce(
          (acc: number, cur: any) => acc + cur.value,
          0,
        ) / origins[key].detail.length;
      origins[key].totalPercentage = isNaN(totalPercentage)
        ? 0
        : totalPercentage;
    });

    const table: DashBoardTableElements[] = [];
    suppliersMap.forEach((supplier: any) => {
      table.push({
        supplierId: supplier.supplierId,
        supplierName: supplier.supplierName,
        companyId: supplier.companyId,
        materials: supplier.materials,
        origins: supplier.origins,
        baselineVolume: supplier.totalBaselineVolume,
        dfs: supplier.dfs,
        sda: supplier.sda,
        tpl: supplier.tpl,
      });
    });

    return {
      table: table,
      breakDown: { materials, origins } as any,
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
