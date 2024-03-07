import { useRef, useState } from 'react';
import { Transition } from '@headlessui/react';
import { MapProvider } from 'react-map-gl/maplibre';

import { tasksSSR } from 'services/ssr';
import ApplicationLayout from 'layouts/application';
import CollapseButton from 'containers/collapse-button/component';
import TitleTemplate from 'utils/titleTemplate';
import Map from 'containers/analysis-eudr/map';
import SuppliersStackedBar from '@/containers/analysis-eudr/suppliers-stacked-bar';
import EUDRFilters from '@/containers/analysis-eudr/filters/component';
import SupplierListTable from '@/containers/analysis-eudr/supplier-list-table';

import type { NextPageWithLayout } from 'pages/_app';
import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';

const MapPage: NextPageWithLayout = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <MapProvider>
      <TitleTemplate title="EUDR" />
      <div className="flex h-full w-full">
        <aside className="relative h-full flex-shrink-0 rounded-tl-3xl bg-gray-100">
          <div className="absolute right-0 top-6 z-40 translate-x-1/2 transform">
            <CollapseButton isCollapsed={isCollapsed} onClick={setIsCollapsed} />
          </div>
          <Transition
            as="div"
            show={!isCollapsed}
            enter="transform transition ease-in duration-100"
            enterFrom="opacity-10"
            enterTo="opacity-100"
            leave="transform transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-10"
            className="h-full w-[820px] overflow-y-auto overflow-x-hidden"
            ref={scrollRef}
          >
            <div className="flex h-full flex-col">
              <div className="space-y-2 px-6 py-8">
                <h2>EUDR complience Analysis</h2>
                <EUDRFilters />
              </div>
              <div className="flex-1 space-y-7 bg-white px-6 py-8">
                <SuppliersStackedBar />
                <SupplierListTable />
              </div>
            </div>
          </Transition>
        </aside>

        <section className="relative flex h-screen flex-1 flex-col overflow-auto">
          <Map />
        </section>
      </div>
    </MapProvider>
  );
};

MapPage.Layout = function getLayout(page: ReactElement) {
  return <ApplicationLayout>{page}</ApplicationLayout>;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  try {
    const tasks = await tasksSSR({ req, res });
    if (tasks && tasks[0]?.attributes.status === 'processing') {
      return {
        redirect: {
          permanent: false,
          destination: '/data',
        },
      };
    }
    return { props: { query } };
  } catch (error) {
    if (error.code === '401' || error.response.status === 401) {
      return {
        redirect: {
          permanent: false,
          destination: '/auth/signin',
        },
      };
    }
  }
};

export default MapPage;
