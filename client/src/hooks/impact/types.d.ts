import type { ImpactData, ImpactTableData, TableComparisonMode } from 'types';

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
