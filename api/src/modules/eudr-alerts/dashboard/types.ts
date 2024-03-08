import { ApiProperty } from '@nestjs/swagger';

export class EUDRDashboard {
  @ApiProperty({ type: () => DashBoardTableElements, isArray: true })
  table: DashBoardTableElements[];

  @ApiProperty({ description: 'Not available yet' })
  breakDown: any;
}

export class DashBoardTableElements {
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

  @ApiProperty({ type: () => EUDRAlertMaterial, isArray: true })
  materials: EUDRAlertMaterial[];

  @ApiProperty({ type: () => EUDRAlertOrigin, isArray: true })
  origins: EUDRAlertOrigin[];
}

export class EUDRAlertMaterial {
  @ApiProperty()
  materialName: string;

  @ApiProperty()
  id: string;
}

export class EUDRAlertOrigin {
  @ApiProperty()
  originName: string;

  @ApiProperty()
  id: string;
}

export class EUDRBreakDown {
  materials: BreakDownMaterialCategory;

  origins: any;
}

export class BreakDownMaterialCategory {
  category: 'material';

  detail: BreakDownSupplierDetail[];
}

export class BreakDownSupplierDetail {
  // Deforestation-free, partial-deforestation, etc
  name: string;
  value: string;

  data: BreakDownByMaterial[];
}

export class BreakDownByMaterial {
  // material or origin name
  name: string;

  // percentaje
  value: number;
}
