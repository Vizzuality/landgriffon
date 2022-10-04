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
  purchasedTonnes?: ScenariosImpactTablePurchasedTonnes[];
}

export class PaginatedScenariosImpactTable {
  @ApiProperty({ type: () => ScenariosImpactTable })
  data: ScenariosImpactTable;
  @ApiProperty({ type: () => PaginationMeta })
  metadata?: PaginationMeta;
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
  @ApiProperty({ type: () => ScenariosYearSumData, isArray: true })
  yearSum: ScenariosYearSumData[];
  @ApiProperty()
  metadata: { unit: string };
  @ApiProperty({ type: () => ScenariosImpactTableRowsValues, isArray: true })
  values?: ScenariosImpactTableRowsValues[];
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
  newImpact?: number;
  canceledImpact?: number;
  impactResult?: number;
}

export class ScenariosYearSumData {
  @ApiProperty()
  year: number;
  @ApiProperty()
  values: ScenarioImpact[];
}

export class ScenariosImpactTablePurchasedTonnes {
  @ApiProperty()
  year: number;
  @ApiProperty()
  values: ScenarioTonnage[];
  @ApiProperty()
  isProjected: boolean;
}

export class ScenarioTonnage {
  scenarioId: string;
  newTonnage?: number;
  canceledTonnage?: number;
  tonnageDifference?: number;
}
