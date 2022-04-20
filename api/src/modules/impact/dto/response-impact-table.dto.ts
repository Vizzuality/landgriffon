import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from 'utils/app-base.service';

export class ImpactTable {
  @ApiProperty({ type: () => ImpactTableDataByIndicator, isArray: true })
  impactTable: ImpactTableDataByIndicator[];
  @ApiProperty({ type: () => ImpactTableDataByIndicator, isArray: true })
  purchasedTonnes: ImpactTablePurchasedTonnes[];
}

export class PaginatedImpactTable {
  @ApiProperty({ type: () => ImpactTable })
  data: ImpactTable;
  @ApiProperty({ type: () => PaginationMeta })
  metadata?: PaginationMeta;
}

export class ImpactTableDataByIndicator {
  @ApiProperty()
  indicatorShortName: string;
  @ApiProperty()
  indicatorId: string;
  @ApiProperty()
  groupBy: string;
  @ApiProperty({ type: () => ImpactTableRows, isArray: true })
  rows: ImpactTableRows[];
  @ApiProperty({ type: () => YearSumData, isArray: true })
  yearSum: YearSumData[];
  @ApiProperty()
  metadata: { unit: string };
  @ApiProperty({ type: () => ImpactTableRowsValues, isArray: true })
  values?: ImpactTableRowsValues[];
}

export class ImpactTablePurchasedTonnes {
  @ApiProperty()
  year: number;
  @ApiProperty()
  value: number;
  @ApiProperty()
  isProjected: boolean;
}
export class ImpactTableRows {
  @ApiProperty()
  name: string;
  @ApiProperty({ type: () => ImpactTableRowsValues, isArray: true })
  values: ImpactTableRowsValues[];
  @ApiProperty({ type: () => ImpactTableRows, isArray: true })
  children: ImpactTableRows[];
}

export class YearSumData {
  @ApiProperty()
  year: number;
  @ApiProperty()
  value: number;
}

export class ImpactTableRowsValues {
  @ApiProperty()
  year: number;
  @ApiProperty()
  value: number;
  @ApiProperty()
  isProjected: boolean;
}
