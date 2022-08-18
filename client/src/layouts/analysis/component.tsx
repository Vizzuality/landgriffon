import { useEffect, useRef, useState, Children, isValidElement, cloneElement } from 'react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import { Transition } from '@headlessui/react';
import classNames from 'classnames';

import { useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';

import ApplicationLayout from 'layouts/application';
import PageLoading from 'containers/page-loading';
import CollapseButton from 'containers/collapse-button';
import type { AnalysisLayoutProps } from './types';

const AnalysisVisualizationNoSSR = dynamic(() => import('containers/analysis-visualization'), {
  ssr: false,
});

const AnalysisLayout: React.FC<AnalysisLayoutProps> = ({ loading = false, children }) => {
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
  const clonedChildren = Children.map(children, (Child) => {
    if (isValidElement(Child)) {
      return cloneElement(Child, { scrollref: scrollRef });
    }
    return null;
  });

  return (
    <ApplicationLayout>
      <>
        {loading && <PageLoading />}

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
            })}
          >
            <AnalysisVisualizationNoSSR />
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
              {clonedChildren}
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
    </ApplicationLayout>
  );
};

export default AnalysisLayout;
