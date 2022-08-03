import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMeta } from 'utils/app-base.service';

export class ScenariosImpactTable {
  @ApiProperty({
    type: () => ScenariosImpactTableDataByIndicator,
    isArray: true,
  })
  scenariosImpactTable: ScenariosImpactTableDataByIndicator[];
  @ApiProperty({
    type: () => ScenariosImpactTableDataByIndicator,
    isArray: true,
  })
  purchasedTonnes?: ImpactTablePurchasedTonnes[];
}

export class PaginatedScenariosImpactTable {
  @ApiProperty({ type: () => ScenariosImpactTable })
  data: ScenariosImpactTable;
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

export class ScenariosImpactTableDataByIndicator {
  @ApiProperty()
  indicatorShortName: string;
  @ApiProperty()
  indicatorId: string;
  @ApiProperty()
  groupBy: string;
  @ApiProperty({ type: () => ScenariosImpactTableRows, isArray: true })
  rows: ScenariosImpactTableRows[];
  @ApiProperty({ type: () => YearSumData, isArray: true })
  yearSum?: YearSumData[];
  @ApiProperty()
  metadata: { unit: string };
  @ApiProperty({ type: () => ScenariosImpactTableRowsValues, isArray: true })
  values?: ScenariosImpactTableRowsValues[];

  @ApiPropertyOptional({
    description:
      'Extra information used for Ranked ImpactTable requests. Missing on normal ImpactTable requests',
  })
  others?: ImpactTableDataAggregationInfo;
}

export class ScenariosImpactTableRows {
  @ApiProperty()
  name: string;
  @ApiProperty({ type: () => ScenariosImpactTableRowsValues, isArray: true })
  values: ScenariosImpactTableRowsValues[];
  @ApiProperty({ type: () => ScenariosImpactTableRows, isArray: true })
  children: ScenariosImpactTableRows[];
}

export class ScenariosImpactTableRowsValues {
  @ApiProperty()
  year: number;
  @ApiProperty({ type: () => ScenarioImpact, isArray: true })
  scenariosImpacts: ScenarioImpact[];
  @ApiPropertyOptional()
  absoluteDifference?: number;
  @ApiPropertyOptional()
  percentageDifference?: number;
  @ApiProperty()
  isProjected: boolean;
}

export class ScenarioImpact {
  scenarioId: string;
  impact: number;
}

export class YearSumData {
  @ApiProperty()
  year: number;
  @ApiProperty()
  value: number;
  @ApiPropertyOptional()
  interventionValue?: number;
  @ApiPropertyOptional()
  absoluteDifference?: number;
  @ApiPropertyOptional()
  percentageDifference?: number;
}

export class ImpactTablePurchasedTonnes {
  @ApiProperty()
  year: number;
  @ApiProperty()
  value: number;
  @ApiProperty()
  isProjected: boolean;
}
