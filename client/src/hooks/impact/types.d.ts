import type { ComparisonMode as TableComparisonMode } from 'containers/analysis-visualization/analysis-table/types';
import type { ImpactData, ImpactTableData } from 'types';

export type ImpactDataApiResponse<Mode extends TableComparisonMode> = Omit<
  ImpactData<Mode>,
  'data'
> & {
  data: Omit<ImpactData<Mode>['data'], 'impactTable'> & Mode extends 'scenario'
    ? { scenarioVsScenarioImpactTable: ImpactTableData<Mode>[] }
    : { impactTable: ImpactTableData<Mode>[] };
};

export type ImpactData<Mode extends ComparisonMode = false> = {
  data: {
    impactTable: ImpactTableData<Mode>[];
    purchasedTonnes?: PurchasedTonnesData[];
  };
  metadata: PaginationMetadata;
};
