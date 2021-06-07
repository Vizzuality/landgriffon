import Link from 'next/link';

import type { Page } from './types';

type BreadcrumbProps = {
  pages: Page[]
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ pages }: BreadcrumbProps) => (
  <nav className="flex" aria-label="Breadcrumb">
    <ol className="flex items-center space-x-4">
      <li>
        <div>
          <Link href="/analysis" shallow>
            <a className="text-gray-400 hover:text-gray-500" aria-current="page">
              Analysis
            </a>
          </Link>
        </div>
      </li>
      {pages.map((page) => (
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
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                aria-current={page.current ? 'page' : undefined}
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

export default Breadcrumb;
