import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from 'utils/app-base.service';
import {
  BaseIndicatorSumByYearData,
  ImpactTableBaseRowsValues,
  ImpactTablePurchasedTonnes,
} from 'modules/impact/dto/response-impact-table.dto';

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
  purchasedTonnes: ImpactTablePurchasedTonnes[];
}

export class ActualVsScenarioPaginatedImpactTable {
  @ApiProperty({ type: () => ActualVsScenarioImpactTable })
  data: ActualVsScenarioImpactTable;
  @ApiProperty({ type: () => PaginationMeta })
  metadata?: PaginationMeta;
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
  @ApiProperty({
    type: () => ActualVsScenarioIndicatorSumByYear,
    isArray: true,
  })
  yearSum: ActualVsScenarioIndicatorSumByYear[];
  @ApiProperty()
  metadata: { unit: string };
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
  id: string;
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

export class ActualVsScenarioIndicatorSumByYear extends BaseIndicatorSumByYearData {
  @ApiProperty()
  value: number;
  @ApiProperty()
  comparedScenarioValue: number;
  @ApiProperty()
  absoluteDifference: number;
  @ApiProperty()
  percentageDifference: number;
}

export class ActualVsScenarioImpactTableRowsValues extends ImpactTableBaseRowsValues {
  @ApiProperty()
  value: number;
  @ApiProperty()
  comparedScenarioValue: number;
  @ApiProperty()
  absoluteDifference: number;
  @ApiProperty()
  percentageDifference: number;
}
