import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMeta } from 'utils/app-base.service';

export class ScenarioVsScenarioImpactTable {
  @ApiProperty({
    type: () => ScenarioVsScenarioImpactTableDataByIndicator,
    isArray: true,
  })
  scenarioVsScenarioImpactTable: ScenarioVsScenarioImpactTableDataByIndicator[];
  @ApiProperty({
    type: () => ScenarioVsScenarioImpactTablePurchasedTonnes,
    isArray: true,
  })
  purchasedTonnes: ScenarioVsScenarioImpactTablePurchasedTonnes[];
}

export class ScenarioVsScenarioPaginatedImpactTable {
  @ApiProperty({ type: () => ScenarioVsScenarioImpactTable })
  data: ScenarioVsScenarioImpactTable;
  @ApiProperty({ type: () => PaginationMeta })
  metadata?: PaginationMeta;
}

export class ScenarioVsScenarioImpactTableDataAggregationInfo {
  aggregatedValues: ScenarioVsScenarioImpactTableDataAggregatedValue[];
  numberOfAggregatedEntities: number;
  sort: string;
}
export class ScenarioVsScenarioImpactTableDataAggregatedValue {
  year: number;
  value: number;
}

export class ScenarioVsScenarioImpactTableDataByIndicator {
  @ApiProperty()
  indicatorShortName: string;
  @ApiProperty()
  indicatorId: string;
  @ApiProperty()
  groupBy: string;
  @ApiProperty({ type: () => ScenarioVsScenarioImpactTableRows, isArray: true })
  rows: ScenarioVsScenarioImpactTableRows[];
  @ApiProperty({ type: () => ScenarioVsScenarioYearSumData, isArray: true })
  yearSum: ScenarioVsScenarioYearSumData[];
  @ApiProperty()
  metadata: { unit: string };
  @ApiProperty({
    type: () => ScenarioVsScenarioImpactTableRowsValues,
    isArray: true,
  })
  values?: ScenarioVsScenarioImpactTableRowsValues[];

  @ApiPropertyOptional({
    description:
      'Extra information used for Ranked ImpactTable requests. Missing on normal ImpactTable requests',
  })
  others?: ScenarioVsScenarioImpactTableDataAggregationInfo;
}

export class ScenarioVsScenarioImpactTablePurchasedTonnes {
  @ApiProperty()
  year: number;
  @ApiProperty()
  value: number;
  @ApiProperty()
  isProjected: boolean;
}
export class ScenarioVsScenarioImpactTableRows {
  @ApiProperty()
  name: string;
  @ApiProperty({
    type: () => ScenarioVsScenarioImpactTableRowsValues,
    isArray: true,
  })
  values: ScenarioVsScenarioImpactTableRowsValues[];
  @ApiProperty({ type: () => ScenarioVsScenarioImpactTableRows, isArray: true })
  children: ScenarioVsScenarioImpactTableRows[];
}

export class ScenarioVsScenarioYearSumData {
  @ApiProperty()
  year: number;
  @ApiPropertyOptional()
  scenarioOneValue: number;
  @ApiPropertyOptional()
  scenarioTwoValue: number;
  @ApiPropertyOptional()
  absoluteDifference?: number;
  @ApiPropertyOptional()
  percentageDifference?: number;
}

export class ScenarioVsScenarioImpactTableRowsValues {
  @ApiProperty()
  year: number;
  @ApiPropertyOptional()
  scenarioOneValue?: number;
  @ApiPropertyOptional()
  scenarioTwoValue?: number;
  @ApiPropertyOptional()
  absoluteDifference?: number;
  @ApiPropertyOptional()
  percentageDifference?: number;
  @ApiProperty()
  isProjected: boolean;
}
