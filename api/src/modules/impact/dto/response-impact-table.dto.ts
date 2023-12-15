import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMeta } from 'utils/app-base.service';
import {
  ActualVsScenarioImpactTableRows,
  ActualVsScenarioImpactTableRowsValues,
} from 'modules/impact/dto//response-actual-scenario.dto';
import {
  ScenarioVsScenarioImpactTableRows,
  ScenarioVsScenarioImpactTableRowsValues,
} from 'modules/impact/dto/response-scenario-scenario.dto';
import { GROUP_BY_VALUES } from 'modules/impact/dto/impact-table.dto';

export class ImpactTable {
  @ApiProperty({ type: () => ImpactTableDataByIndicator, isArray: true })
  impactTable: ImpactTableDataByIndicator[];
  @ApiProperty({ type: () => ImpactTablePurchasedTonnes, isArray: true })
  purchasedTonnes: ImpactTablePurchasedTonnes[];
}

export class PaginatedImpactTable {
  @ApiProperty({ type: () => ImpactTable })
  data: ImpactTable;
  @ApiProperty({ type: () => PaginationMeta })
  metadata?: PaginationMeta;
}

export class ImpactTableDataAggregationInfo {
  aggregatedValues: ImpactTableDataAggregatedValue[];
  numberOfAggregatedEntities: number;
  sort: string;
}

export class ImpactTableDataAggregatedValue {
  year: number;
  value: number;
}

export class ImpactTableDataByIndicator {
  @ApiProperty()
  indicatorShortName: string;
  @ApiProperty()
  indicatorId: string;
  @ApiProperty()
  groupBy: GROUP_BY_VALUES;
  @ApiProperty({ type: () => ImpactTableRows, isArray: true })
  rows: ImpactTableRows[];
  @ApiProperty({ type: () => YearSumData, isArray: true })
  yearSum: YearSumData[];
  @ApiProperty()
  metadata: { unit: string };
  @ApiPropertyOptional({
    description:
      'Extra information used for Ranked ImpactTable requests. Missing on normal ImpactTable requests',
  })
  others?: ImpactTableDataAggregationInfo;
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
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
    },
  })
  children: ImpactTableRows[];
}

export class BaseIndicatorSumByYearData {
  @ApiProperty()
  year: number;
  @ApiProperty()
  isProjected: boolean;
}

export class YearSumData {
  @ApiProperty()
  value: number;
}

export class ImpactTableBaseRowsValues {
  @ApiProperty()
  year: number;
  @ApiProperty()
  isProjected: boolean;
}

export class ImpactTableRowsValues extends ImpactTableBaseRowsValues {
  @ApiProperty()
  value: number;
}

export type AnyImpactTableRowsValues =
  | ImpactTableRowsValues
  | ActualVsScenarioImpactTableRowsValues
  | ScenarioVsScenarioImpactTableRowsValues;

export type AnyImpactTableRows =
  | ImpactTableRows
  | ActualVsScenarioImpactTableRows
  | ScenarioVsScenarioImpactTableRows;
