import { useRef, useState } from 'react';
import { Transition } from '@headlessui/react';
import { MapProvider } from 'react-map-gl/maplibre';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

import { tasksSSR } from 'services/ssr';
import ApplicationLayout from 'layouts/application';
import CollapseButton from 'containers/collapse-button/component';
import TitleTemplate from 'utils/titleTemplate';
import EUDRFilters from '@/containers/analysis-eudr-detail/filters';
import { Button } from '@/components/ui/button';
import { useEUDRSupplier } from '@/hooks/eudr';
import SupplierInfo from '@/containers/analysis-eudr-detail/supplier-info';
import SupplierSourcingInfo from '@/containers/analysis-eudr-detail/sourcing-info';
import { Separator } from '@/components/ui/separator';
import DeforestationAlerts from '@/containers/analysis-eudr-detail/deforestation-alerts';
import { eudrDetail } from '@/store/features/eudr-detail';
import { useAppSelector } from '@/store/hooks';

import type { NextPageWithLayout } from 'pages/_app';
import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';

const DynamicMap = dynamic(() => import('containers/analysis-eudr/map'), {
  ssr: false,
});

const DynamicCompareMap = dynamic(() => import('containers/analysis-eudr/map/compare'), {
  ssr: false,
});

const MapPage: NextPageWithLayout = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { planetCompareLayer } = useAppSelector((state) => state.eudr);
  const {
    filters: { dates },
  } = useAppSelector(eudrDetail);

  const { supplierId }: { supplierId: string } = useParams();
  const { data } = useEUDRSupplier(supplierId, {
    startAlertDate: dates.from,
    endAlertDate: dates.to,
  });

  return (
    <MapProvider>
      <TitleTemplate
        title={`${data?.name ? `${data.name} - EUDR | LandGriffon` : 'EUDR | LandGriffon'}`}
      />
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
                <h2>{data?.name || '-'}</h2>
                <div className="flex space-x-4">
                  <Button
                    variant="ghost"
                    className="h-auto space-x-1 border border-gray-200 bg-white shadow-sm"
                    asChild
                  >
                    <Link href="/eudr" className="space-x-2">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </Link>
                  </Button>
                  <EUDRFilters />
                </div>
              </div>
              <div className="flex-1 space-y-7 bg-white px-6 py-8">
                <SupplierInfo />
                <Separator className="border border-dashed border-gray-200 bg-transparent" />
                <SupplierSourcingInfo />
                <DeforestationAlerts />
              </div>
            </div>
          </Transition>
        </aside>

        <section className="relative flex h-screen flex-1 flex-col">
          {!planetCompareLayer.active && <DynamicMap supplierId={supplierId} />}
          {planetCompareLayer.active && <DynamicCompareMap />}
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
