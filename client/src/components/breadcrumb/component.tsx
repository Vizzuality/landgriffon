import classNames from 'classnames';
import Link from 'next/link';
import type { Page } from './types';

export type BreadcrumbProps = {
  pages: Page[];
};

const BREADCRUMB_ITEM_CLASSNAME = 'text-sm font-medium hover:text-gray-900';

const Breadcrumb: React.FC<BreadcrumbProps> = ({ pages }: BreadcrumbProps) => {
  if (pages.length === 0) return null;

  const middlePages = [...pages].slice(1, pages.length);

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <div>
            <Link href={pages[0].href} shallow>
              <a
                className={classNames(
                  BREADCRUMB_ITEM_CLASSNAME,
                  pages.length === 1 ? 'text-gray-900' : 'text-gray-600',
                )}
              >
                {pages[0].name}
              </a>
            </Link>
          </div>
        </li>
        {middlePages.map((page, index) => (
          <li key={page.name}>
            <div className="flex items-center">
              <svg
                className="flex-shrink-0 h-5 w-5 text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <Link href={page.href} shallow>
                <a
                  className={classNames(
                    BREADCRUMB_ITEM_CLASSNAME,
                    'ml-2',
                    index === middlePages.length - 1 ? 'text-gray-900' : 'text-gray-600',
                  )}
                >
                  {page.name}
                </a>
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
