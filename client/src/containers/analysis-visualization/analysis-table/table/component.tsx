import React, { useState, useEffect, useCallback, useMemo } from 'react';
import cx from 'classnames';

import { useAppSelector } from 'store/hooks';
import { analysisFilters } from 'store/features/analysis/filters';

import Loading from 'components/loading';

import type { TableProps } from 'components/table/component';
import Table from 'components/table/component';
import type { ImpactTableData } from 'types';

type AnalysisTableProps = TableProps<ImpactTableData>;

const AnalysisTable = ({ isLoading = false, ...props }: AnalysisTableProps) => {
  const { indicator } = useAppSelector(analysisFilters);

  const [apiSorting, setApiSorting] = useState<TableProps<T>['state']['sorting']>(() => [
    {
      id: props.columns[0]?.id,
      desc: false,
    },
  ]);

  return (
    <div
      className={cx('relative', className, {
        'my-4': !className,
      })}
    >
      {isLoading && (
        <div className="absolute top-0 bottom-0 left-0 right-0 z-30 flex flex-col items-center justify-center bg-white bg-opacity-60 backdrop-blur-xs">
          <Loading className="w-12 h-12" />
          <span className="mt-4 text-gray-600">Loading...</span>
        </div>
      )}
      <Table
        {...tableProps}
        paging={paging}
        sortingMode={sortingMode}
        childComponents={childComponents}
        dispatch={dispatch}
      />
    </div>
  );
};

export default AnalysisTable;
