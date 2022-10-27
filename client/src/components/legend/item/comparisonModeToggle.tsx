import classNames from 'classnames';
import { useCallback } from 'react';

import { scenarios, setComparisonMode } from 'store/features/analysis';
import { useAppDispatch, useAppSelector } from 'store/hooks';

import type { ScenarioComparisonMode } from 'store/features/analysis/scenarios';

const COMMON_MODE_BUTTON_CLASSNAMES = 'border px-1 p-0.5';
const ACTIVE_BUTTON_CLASSNAMES = 'text-navy-400 border-navy-400 bg-navy-50';
const DISABLED_BUTTON_CLASSNAMES = 'text-gray-400 border-gray-400';

export const ComparisonToggle = () => {
  const dispatch = useAppDispatch();
  const { comparisonMode } = useAppSelector(scenarios);

  const getHandleChangeComparison = useCallback(
    (mode: ScenarioComparisonMode) => () => dispatch(setComparisonMode(mode)),
    [dispatch],
  );

  return (
    <div className="flex flex-row text-sm w-fit">
      <button
        className={classNames(
          COMMON_MODE_BUTTON_CLASSNAMES,
          'rounded-l-md',
          comparisonMode === 'absolute' ? ACTIVE_BUTTON_CLASSNAMES : DISABLED_BUTTON_CLASSNAMES,
          {
            'border-r-0': comparisonMode !== 'absolute',
          },
        )}
        type="button"
        onClick={getHandleChangeComparison('absolute')}
      >
        absolute
      </button>
      <button
        type="button"
        className={classNames(
          COMMON_MODE_BUTTON_CLASSNAMES,
          'rounded-r-md',
          comparisonMode === 'relative' ? ACTIVE_BUTTON_CLASSNAMES : DISABLED_BUTTON_CLASSNAMES,
          {
            'border-l-0': comparisonMode !== 'relative',
          },
        )}
        onClick={getHandleChangeComparison('relative')}
      >
        relative
      </button>
    </div>
  );
};
