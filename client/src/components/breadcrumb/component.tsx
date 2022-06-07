import { useCallback } from 'react';
import classNames from 'classnames';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setMode, scenarios } from 'store/features/analysis/scenarios';
import { setSubContentCollapsed } from 'store/features/analysis';

import type { Page } from './types';
import { useRouter } from 'next/router';

export type BreadcrumbProps = {
  pages: Page[];
};

const BREADCRUMB_ITEM_CLASSNAME = 'text-sm font-medium hover:text-gray-900';

const Breadcrumb: React.FC<BreadcrumbProps> = ({ pages }: BreadcrumbProps) => {
  const dispatch = useAppDispatch();
  const { mode } = useAppSelector(scenarios);
  const middlePages = [...pages].slice(1, pages.length);
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (pages[0].mode === 'list') {
      dispatch(setSubContentCollapsed(true));
    }

    if (pages[0].href === 'analysis') {
      router.push('/analysis');
    } else {
      // router.replace(`${router.pathname}/${pages[0].href}`);
    }
    dispatch(setMode(pages[0].mode));
  }, [dispatch, router, pages]);

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <button
            className={classNames(
              BREADCRUMB_ITEM_CLASSNAME,
              pages.length === 1 ? 'text-gray-900' : 'text-gray-600',
            )}
            onClick={handleClick}
          >
            {pages[0].name}
          </button>
        </li>
        {middlePages.map((page) => (
          <li key={page.name} className="flex items-center">
            <svg
              className="flex-shrink-0 h-5 w-5 text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
            </svg>
            <button
              className={classNames(
                BREADCRUMB_ITEM_CLASSNAME,
                page.mode === mode ? 'text-gray-900' : 'text-gray-600',
              )}
              onClick={handleClick}
            >
              {page.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
