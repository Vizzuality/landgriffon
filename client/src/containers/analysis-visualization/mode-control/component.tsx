import Link from 'next/link';
import classNames from 'classnames';
import { ChartPieIcon, MapIcon, TableIcon } from '@heroicons/react/outline';
import type { AnalysisState } from 'store/features/analysis';
import type { ParsedUrlQuery } from 'querystring';

const CONTROL_ITEM_CLASS_NAMES =
  'relative inline-flex items-center px-4 py-1.5 border border-gray-100 bg-white text-sm font-medium text-gray-600 hover:bg-green-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700';
const CONTROL_ITEM_ACTIVE_CLASS_NAMES =
  'z-10 outline-none ring-1 ring-green-700 text-green-700 border-green-700 bg-green-50';

export type ModeControlProps = {
  query: ParsedUrlQuery;
  mode: AnalysisState['visualizationMode'];
};

const ModeControl: React.FC<ModeControlProps> = ({ query, mode }: ModeControlProps) => (
  <div className="inline-flex shadow-sm rounded-md">
    <Link
      href={{
        pathname: '/analysis',
        query: { ...query, mode: 'map' },
      }}
    >
      <a
        className={classNames(CONTROL_ITEM_CLASS_NAMES, 'rounded-l-md', {
          [CONTROL_ITEM_ACTIVE_CLASS_NAMES]: mode === 'map',
        })}
      >
        <MapIcon className="h-6 w-6" aria-hidden="true" />
      </a>
    </Link>
    <Link
      href={{
        pathname: '/analysis',
        query: { ...query, mode: 'table' },
      }}
    >
      <a
        className={classNames(CONTROL_ITEM_CLASS_NAMES, '-ml-px', {
          [CONTROL_ITEM_ACTIVE_CLASS_NAMES]: mode === 'table',
        })}
      >
        <TableIcon className="h-6 w-6" aria-hidden="true" />
      </a>
    </Link>
    <Link
      href={{
        pathname: '/analysis',
        query: { ...query, mode: 'chart' },
      }}
    >
      <a
        className={classNames(CONTROL_ITEM_CLASS_NAMES, '-ml-px rounded-r-md', {
          [CONTROL_ITEM_ACTIVE_CLASS_NAMES]: mode === 'chart',
        })}
      >
        <ChartPieIcon className="h-6 w-6" aria-hidden="true" />
      </a>
    </Link>
  </div>
);

export default ModeControl;
