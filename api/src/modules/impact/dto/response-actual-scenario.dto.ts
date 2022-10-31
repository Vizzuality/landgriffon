import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMeta } from 'utils/app-base.service';

export class ActualVsScenarioImpactTable {
  @ApiProperty({
    type: () => ActualVsScenarioImpactTableDataByIndicator,
    isArray: true,
  })
  impactTable: ActualVsScenarioImpactTableDataByIndicator[];
  @ApiProperty({
    type: () => ActualVsScenarioImpactTablePurchasedTonnes,
    isArray: true,
  })
  purchasedTonnes: ActualVsScenarioImpactTablePurchasedTonnes[];
}

export class ActualVsScenarioPaginatedImpactTable {
  @ApiProperty({ type: () => ActualVsScenarioImpactTable })
  data: ActualVsScenarioImpactTable;
  @ApiProperty({ type: () => PaginationMeta })
  metadata?: PaginationMeta;
}

export class ActualVsScenarioImpactTableDataAggregationInfo {
  aggregatedValues: ActualVsScenarioImpactTableDataAggregatedValue[];
  numberOfAggregatedEntities: number;
  sort: string;
}
export class ActualVsScenarioImpactTableDataAggregatedValue {
  year: number;
  value: number;
}

export class ActualVsScenarioImpactTableDataByIndicator {
  @ApiProperty()
  indicatorShortName: string;
  @ApiProperty()
  indicatorId: string;
  @ApiProperty()
  groupBy: string;
  @ApiProperty({ type: () => ActualVsScenarioImpactTableRows, isArray: true })
  rows: ActualVsScenarioImpactTableRows[];
  @ApiProperty({ type: () => ActualVsScenarioYearSumData, isArray: true })
  yearSum: ActualVsScenarioYearSumData[];
  @ApiProperty()
  metadata: { unit: string };
  @ApiProperty({
    type: () => ActualVsScenarioImpactTableRowsValues,
    isArray: true,
  })
  values?: ActualVsScenarioImpactTableRowsValues[];

  @ApiPropertyOptional({
    description:
      'Extra information used for Ranked ImpactTable requests. Missing on normal ImpactTable requests',
  })
  others?: ActualVsScenarioImpactTableDataAggregationInfo;
}

export class ActualVsScenarioImpactTablePurchasedTonnes {
  @ApiProperty()
  year: number;
  @ApiProperty()
  value: number;
  @ApiProperty()
  isProjected: boolean;
}
export class ActualVsScenarioImpactTableRows {
  @ApiProperty()
  name: string;
  @ApiProperty({
    type: () => ActualVsScenarioImpactTableRowsValues,
    isArray: true,
  })
  values: ActualVsScenarioImpactTableRowsValues[];
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
    },
  })
  children: ActualVsScenarioImpactTableRows[];
}

export class ActualVsScenarioYearSumData {
  @ApiProperty()
  year: number;
  @ApiProperty()
  value: number;
  @ApiPropertyOptional()
  comparedScenarioValue?: number;
  @ApiPropertyOptional()
  absoluteDifference?: number;
  @ApiPropertyOptional()
  percentageDifference?: number;
  @ApiProperty()
  isProjected?: boolean;
}

export class ActualVsScenarioImpactTableRowsValues {
  @ApiProperty()
  year: number;
  @ApiProperty()
  value: number;
  @ApiPropertyOptional()
  comparedScenarioValue?: number;
  @ApiPropertyOptional()
  absoluteDifference?: number;
  @ApiPropertyOptional()
  percentageDifference?: number;
  @ApiProperty()
  isProjected: boolean;
}
