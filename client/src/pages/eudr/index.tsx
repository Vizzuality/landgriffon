import { useRef, useState } from 'react';
import { Transition } from '@headlessui/react';
import { MapProvider } from 'react-map-gl/maplibre';

import { tasksSSR } from 'services/ssr';
import ApplicationLayout from 'layouts/application';
import CollapseButton from 'containers/collapse-button/component';
import TitleTemplate from 'utils/titleTemplate';
import Map from 'components/map';
import LayerManager from 'components/map/layer-manager';

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
              <div className="px-6 py-8">
                <h2>EUDR complience Analysis</h2>
              </div>
              <div className="flex-1 bg-white px-6 py-8">
                <div>
                  <div className="text-xs text-gray-400">
                    Total numbers of suppliers: <span className="font-mono">46.53P</span>
                  </div>
                  <h3>Suppliers by category</h3>
                </div>
              </div>
            </div>
          </Transition>
        </aside>

        <section className="relative flex h-screen flex-1 flex-col overflow-auto">
          <Map id="eudr-map">
            {() => (
              <>
                <LayerManager layers={[]} />
                {/* {tooltipData && tooltipData.data?.v && (
                  <PopUp
                    position={{
                      ...tooltipData.viewport,
                      x: tooltipData.x,
                      y: tooltipData.y,
                    }}
                  >
                    <div className="space-y-2 rounded-md bg-white p-4 shadow-md">
                      <div className="text-sm font-semibold text-gray-900">
                        {tooltipData.data.v}
                        {tooltipData.data.unit && ` ${tooltipData.data.unit}`}
                      </div>
                      <div className="text-xs text-gray-500">{tooltipData.data.name}</div>
                    </div>
                  </PopUp>
                )} */}
              </>
            )}
          </Map>
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
    if (error.response.status === 401) {
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
