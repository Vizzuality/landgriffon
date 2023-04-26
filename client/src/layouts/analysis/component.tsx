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
    <div className="flex w-full h-full">
      <TitleTemplate title="Analysis" />

      <aside className="relative flex-shrink-0 h-full bg-white rounded-tl-3xl">
        <div className="absolute right-0 z-10 transform translate-x-1/2 top-6">
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
          className="h-full px-12 overflow-x-hidden overflow-y-auto w-[410px]"
          ref={scrollRef}
        >
          <AnalysisSidebar scrollref={scrollRef} />
        </Transition>
      </aside>

      <section className="relative flex-1 h-screen overflow-auto">
        <div
          className={classNames(
            {
              'absolute top-6 left-6 xl:left-12 right-6 z-10': visualizationMode === 'map',
              'p-6': visualizationMode !== 'map',
            },
            'flex flex-wrap gap-2 justify-between',
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
