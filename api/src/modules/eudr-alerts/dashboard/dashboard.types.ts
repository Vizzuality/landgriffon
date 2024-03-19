import { ApiProperty } from '@nestjs/swagger';

export class AffectedPlots {
  @ApiProperty()
  dfs: string[];
  @ApiProperty()
  sda: string[];
}

export class DashBoardTableElements {
  supplierId: string;
  @ApiProperty()
  supplierName: string;

  // rename to companyCode?
  @ApiProperty()
  companyId: string;

  // EUDR baseline volume, purchase of 2020, accumulate of all the comodditie
  @ApiProperty()
  baselineVolume: number;

  // percentage of deforestation free plots for each supplier.
  @ApiProperty()
  dfs: number;

  @ApiProperty()
  sda: number;

  @ApiProperty()
  tpl: number;

  @ApiProperty()
  crm: number;

  @ApiProperty({ type: () => EntitiesBySupplier, isArray: true })
  materials: EntitiesBySupplier[];

  @ApiProperty({ type: () => EntitiesBySupplier, isArray: true })
  origins: EntitiesBySupplier[];

  @ApiProperty({ type: () => AffectedPlots })
  plots: AffectedPlots;
}

class EntitiesBySupplier {
  @ApiProperty()
  name: string;

  @ApiProperty()
  id: string;
}

export enum EUDRDashBoardFields {
  DEFORASTATION_FREE_SUPPLIERS = 'Deforestation-free suppliers',
  SUPPLIERS_WITH_DEFORASTATION_ALERTS = 'Suppliers with deforestation alerts',
  SUPPLIERS_WITH_NO_LOCATION_DATA = 'Suppliers with no location data',
}

class CategoryDetail {
  @ApiProperty()
  totalPercentage: number;

  @ApiProperty({ type: () => BreakDownByEntity, isArray: true })
  detail: BreakDownByEntity[];
}

export type EntityMetadata = {
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

class BreakDownByEUDRCategory {
  @ApiProperty({ type: () => CategoryDetail })
  [EUDRDashBoardFields.DEFORASTATION_FREE_SUPPLIERS]: CategoryDetail;

  @ApiProperty({ type: () => CategoryDetail })
  [EUDRDashBoardFields.SUPPLIERS_WITH_DEFORASTATION_ALERTS]: CategoryDetail;

  @ApiProperty({ type: () => CategoryDetail })
  [EUDRDashBoardFields.SUPPLIERS_WITH_NO_LOCATION_DATA]: CategoryDetail;
}

class BreakDownByEntity {
  @ApiProperty()
  name: string;

  @ApiProperty()
  value: number;
}

export class EUDRBreakDown {
  @ApiProperty({ type: () => BreakDownByEUDRCategory })
  materials: BreakDownByEUDRCategory;

  @ApiProperty({ type: () => BreakDownByEUDRCategory })
  origins: any;
}

export class EUDRDashboard {
  @ApiProperty({ type: () => DashBoardTableElements, isArray: true })
  table: DashBoardTableElements[];

  @ApiProperty({ type: () => EUDRBreakDown })
  breakDown: EUDRBreakDown;
}
