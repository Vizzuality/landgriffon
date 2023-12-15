import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from 'utils/app-base.service';
import {
  BaseIndicatorSumByYearData,
  ImpactTableBaseRowsValues,
  ImpactTablePurchasedTonnes,
} from 'modules/impact/dto/response-impact-table.dto';
import { GROUP_BY_VALUES } from 'modules/impact/dto/impact-table.dto';

export class ScenarioVsScenarioImpactTable {
  @ApiProperty({
    type: () => ScenarioVsScenarioImpactTableDataByIndicator,
    isArray: true,
  })
  impactTable: ScenarioVsScenarioImpactTableDataByIndicator[];
  @ApiProperty({
    type: () => ScenarioVsScenarioImpactTablePurchasedTonnes,
    isArray: true,
  })
  purchasedTonnes: ImpactTablePurchasedTonnes[];
}

export class ScenarioVsScenarioPaginatedImpactTable {
  @ApiProperty({ type: () => ScenarioVsScenarioImpactTable })
  data: ScenarioVsScenarioImpactTable;
  @ApiProperty({ type: () => PaginationMeta })
  metadata?: PaginationMeta;
}

export class ScenarioVsScenarioImpactTableDataByIndicator {
  @ApiProperty()
  indicatorShortName: string;
  @ApiProperty()
  indicatorId: string;
  @ApiProperty()
  groupBy: GROUP_BY_VALUES;
  @ApiProperty({ type: () => ScenarioVsScenarioImpactTableRows, isArray: true })
  rows: ScenarioVsScenarioImpactTableRows[];
  @ApiProperty({
    type: () => ScenarioVsScenarioIndicatorSumByYearData,
    isArray: true,
  })
  yearSum: ScenarioVsScenarioIndicatorSumByYearData[];
  @ApiProperty()
  metadata: { unit: string };
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
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
    },
  })
  children: ScenarioVsScenarioImpactTableRows[];
}

export class ScenarioVsScenarioIndicatorSumByYearData extends BaseIndicatorSumByYearData {
  @ApiProperty()
  baseScenarioValue: number;
  @ApiProperty()
  comparedScenarioValue: number;
  @ApiProperty()
  absoluteDifference: number;
  @ApiProperty()
  percentageDifference: number;
}

export class ScenarioVsScenarioImpactTableRowsValues extends ImpactTableBaseRowsValues {
  @ApiProperty()
  baseScenarioValue: number;
  @ApiProperty()
  comparedScenarioValue: number;
  @ApiProperty()
  absoluteDifference: number;
  @ApiProperty()
  percentageDifference: number;
}
