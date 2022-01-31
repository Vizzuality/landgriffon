import { useMemo } from 'react';
import { DownloadIcon } from '@heroicons/react/outline';
import { InformationCircleIcon } from '@heroicons/react/solid';

import { useImpactData } from 'hooks/impact';

import Button from 'components/button';
import Loading from 'components/loading';
import SingleIndicatorTable from './single-indicator-table';
import MultipleIndicatorTable from './multiple-indicator-table';

const AnalysisTable: React.FC = () => {
  const { data: impactData, isLoading } = useImpactData();

  // initial value of the *props
  const tableData = useMemo(() => {
    const {
      data: { impactTable },
    } = impactData;

    return impactTable;
  }, [impactData]);

  return (
    <>
      <div className="flex justify-between mb-6">
        <div className="flex items-center">
          <p className="m-0">
            <InformationCircleIcon className="inline w-5 h-4 mr-2 text-black" />
            Viewing absolute values for <b>Actual Data</b>
          </p>
        </div>
        <Button
          theme="secondary"
          size="base"
          className="flex-shrink-0"
          onClick={() => console.info('onDownload')}
        >
          <DownloadIcon className="w-5 h-4 mr-2 text-black" />
          Download
        </Button>
      </div>
      <div className="relative">
        {isLoading && <Loading className="text-green-700 -ml-1 mr-3" />}

        {/* Multiple indicators table */}
        {tableData && tableData.length > 1 && <MultipleIndicatorTable data={tableData} />}

        {/* Single indicator table */}
        {tableData && tableData.length === 1 && <SingleIndicatorTable data={tableData[0]} />}
      </div>
    </>
  );
};

export default AnalysisTable;
