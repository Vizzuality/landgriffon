import { useRef } from 'react';
import { Transition } from '@headlessui/react';
import classNames from 'classnames';

import { useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import CollapseButton from 'containers/collapse-button';
import AnalysisSidebar from 'containers/analysis-sidebar';
import AnalysisFilters from 'containers/analysis-visualization/analysis-filters';
import ModeControl from 'containers/mode-control';
import TitleTemplate from 'utils/titleTemplate';

const AnalysisLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { visualizationMode, isSidebarCollapsed } = useAppSelector(analysisUI);

  return (
    <div className="flex h-full w-full">
      <TitleTemplate title="Analysis" />

      <aside className="relative h-full flex-shrink-0 rounded-tl-3xl bg-white">
        <div className="absolute right-0 top-6 z-40 translate-x-1/2 transform">
          <CollapseButton />
        </div>
        <Transition
          as="div"
          show={!isSidebarCollapsed}
          enter="transform transition ease-in duration-100"
          enterFrom="opacity-10"
          enterTo="opacity-100"
          leave="transform transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-10"
          className="h-full w-[410px] overflow-y-auto overflow-x-hidden px-12"
          ref={scrollRef}
        >
          <AnalysisSidebar scrollref={scrollRef} />
        </Transition>
      </aside>

      <section className="relative flex h-screen flex-1 flex-col overflow-auto">
        <div
          className={classNames(
            {
              'absolute left-6 right-6 top-6 z-10 xl:left-12': visualizationMode === 'map',
              'p-6': visualizationMode !== 'map',
            },
            'flex flex-wrap justify-between gap-2',
          )}
        >
          <AnalysisFilters />
          <ModeControl />
        </div>
        {children}
      </section>
    </div>
  );
};

export default AnalysisLayout;
