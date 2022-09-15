import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Transition } from '@headlessui/react';
import classNames from 'classnames';

import { useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';

import CollapseButton from 'containers/collapse-button';
import Scenarios from 'containers/scenarios';
import AnalysisFilters from 'containers/analysis-visualization/analysis-filters';
import ModeControl from 'containers/analysis-visualization/mode-control';
import TitleTemplate from 'utils/titleTemplate';

const AnalysisLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const asideRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<DOMRect>(null);
  const { visualizationMode, isSidebarCollapsed, isSubContentCollapsed } =
    useAppSelector(analysisUI);

  useEffect(() => {
    if (asideRef && asideRef.current) {
      const properties = asideRef.current.getBoundingClientRect();
      const { x } = properties;
      if (x !== 0) setPosition(asideRef.current.getBoundingClientRect());
    }
  }, [asideRef]);

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <TitleTemplate title="Analysis" />
      {/* Primary column */}
      <section
        aria-labelledby="primary-heading"
        className="relative flex flex-col flex-1 h-full min-w-0 overflow-y-auto lg:h-screen lg:order-last"
      >
        <h1 id="primary-heading" className="sr-only">
          Analysis
        </h1>

        {/* TO-DO: scenario edition */}
        {!isSubContentCollapsed && !isSidebarCollapsed && (
          <div className="absolute top-0 left-0 z-10 w-full h-full bg-white min-w-min xl:w-250 lg:flex-shrink-0">
            <div className="flex flex-col w-full h-full p-6 overflow-auto border-r border-gray-200">
              Scenario edition
            </div>
          </div>
        )}

        {/* Map, chart or table */}
        <div
          className={classNames({
            'lg:absolute w-full h-full top-0 left-0 overflow-hidden': visualizationMode === 'map',
            'backdrop-blur-3xl blur-sm pointer-events-none': !isSubContentCollapsed,
            'h-full flex flex-col': visualizationMode !== 'map',
          })}
        >
          <div
            className={classNames(
              {
                'absolute top-6 left-6 xl:left-12 right-6 z-10': visualizationMode === 'map',
                'py-6 pr-6 pl-6 xl:pl-12': visualizationMode !== 'map',
              },
              'flex gap-2 flex-wrap justify-between',
            )}
          >
            <AnalysisFilters />
            <ModeControl />
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </section>

      {/* Secondary column (hidden on smaller screens) */}
      <aside
        className="relative hidden lg:block lg:flex-shrink-0 lg:order-first bg-primary"
        ref={asideRef}
      >
        <Transition
          as="aside"
          show={!isSidebarCollapsed}
          enter="transition-opacity duration-75"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-75"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterEnter={() => setPosition(asideRef?.current?.getBoundingClientRect())}
          afterLeave={() => setPosition(asideRef?.current?.getBoundingClientRect())}
        >
          <div
            ref={scrollRef}
            className="relative flex flex-col h-full px-12 overflow-y-auto bg-white lg:h-screen w-96 rounded-tl-3xl"
          >
            <Scenarios scrollref={scrollRef} />
          </div>
        </Transition>
      </aside>

      {/* Button for collapsing */}
      {typeof window !== 'undefined' &&
        position &&
        createPortal(
          <div
            className={classNames(
              'absolute hidden lg:block top-6 transform -translate-x-1/2 z-20 ease-in-out duration-75',
              {
                'lg:hidden': !isSubContentCollapsed,
              },
            )}
            style={{ left: isSidebarCollapsed ? position.x : position.x + position.width }}
          >
            <CollapseButton />
          </div>,
          document?.body,
        )}
    </>
  );
};

export default AnalysisLayout;
