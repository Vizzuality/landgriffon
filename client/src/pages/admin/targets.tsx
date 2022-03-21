import { useCallback } from 'react';
import Head from 'next/head';
import { InformationCircleIcon } from '@heroicons/react/solid';

import useModal from 'hooks/modals';
import { useTargets } from 'hooks/targets';

import AdminLayout, { ADMIN_TABS } from 'layouts/admin';
import NoData from 'containers/admin/no-data';
import UploadDataSourceModal from 'containers/admin/upload-data-source-modal';
import TargetsList from 'containers/targets/list';
import Button from 'components/button';
import Loading from 'components/loading';

import type { Target } from 'types';
import useIndicators from 'hooks/indicators';

const TableNoSSR = dynamic(() => import('components/table'), { ssr: false });
const TARGETS_DATA: Target[] = [
  {
    id: 'target-1',
    indicatorId: 'Carbon emissions fue to land use change (tCO2)',
    baselineYear: 2015,
    targetYear: 2045,
    value: 2.3,
  },
];

const AdminTargetsPage: React.FC = () => {
  const {
    isOpen: isUploadDataSourceModalOpen,
    open: openUploadDataSourceModal,
    close: closeUploadDataSourceModal,
  } = useModal();

  const { data: indicators } = useIndicators();
  const { data: targets, isLoading } = useTargets();
  const hasData = indicators?.length > 0;
  console.log('indicators: ', indicators);

  const handleCreateTarget = useCallback(() => console.log('create a new target'), []);

  return (
    <AdminLayout
      currentTab={ADMIN_TABS.TARGETS}
      headerButtons={
        <>
          <Button theme="primary" onClick={handleCreateTarget}>
            Create a new target
          </Button>
        </>
      }
    >
      <Head>
        <title>Admin targets | Landgriffon</title>
      </Head>

      {!isLoading && !hasData && <NoData />}

      {isLoading && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loading />
        </div>
      )}

      {hasData && (
        <>
          <div className="flex items-center text-sm text-black py-2">
            <InformationCircleIcon className="w-5 h-5 mr-3 text-black" aria-hidden="true" />
            Target value for each indicator by year
          </div>
          <div className="mt-4 space-y-4">
            {indicators.map(({ id, name }) => (
              <div className="rounded-md bg-white" key={id}>
                <div>{name}</div>
                {/* <div>
                  <div>
                    <div>Baseline</div>
                    <div>2.37Mt</div>
                  </div>
                  <div>
                    <div>2035</div>
                    <div>2.37Mt</div>
                  </div>
                  <div>
                    <div>2040</div>
                    <div>2.37Mt</div>
                  </div>
                  <div>
                    <div>2050</div>
                    <div>2.37Mt</div>
                  </div>
                </div> */}
                <div>
                  <button>Edit</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminTargetsPage;
