import classNames from 'classnames';
import { useCallback } from 'react';

import OpacityControl from './opacityControl';
import DragHandle from './dragHandle';

import InfoToolTip from 'components/info-tooltip/component';
import Loading from 'components/loading';

import type { Dispatch } from 'react';
import type { ScenarioComparisonMode } from 'store/features/analysis/scenarios';

export type LegendItemProps = {
  name: React.ReactNode;
  info?: string;
  unit?: string;
  id: string;
  description?: string;
  isLoading?: boolean;
  showToolbar?: boolean;
  children?: React.ReactNode;
  opacity: number;
  onChangeOpacity: Dispatch<number>;
  onChangeComparisonMode?: Dispatch<ScenarioComparisonMode>;
  main?: boolean;
  comparison?: ScenarioComparisonMode;
};
const COMMON_MODE_BUTTON_CLASSNAMES = 'border px-1 p-0.5';
const ACTIVE_BUTTON_CLASSNAMES = 'text-navy-400 border-navy-400 bg-navy-50';
const DISABLED_BUTTON_CLASSNAMES = 'text-gray-400 border-gray-400';

export const LegendItem = ({
  name,
  info,
  unit,
  isLoading = false,
  showToolbar = true,
  children,
  opacity,
  comparison,
  onChangeOpacity,
  onChangeComparisonMode,
  main = false,
}: LegendItemProps) => {
  const handleChangeComparison = useCallback(
    (mode: ScenarioComparisonMode) => () => onChangeComparisonMode?.(mode),
    [onChangeComparisonMode],
  );

  return (
    <div
      className={classNames('flex flex-row gap-1 relative group py-3 pl-1 pr-2', {
        'bg-gray-50': !main,
      })}
    >
      <DragHandle className="invisible group-hover:visible" />
      <div className="flex-grow min-w-0 space-y-2">
        {isLoading && (
          <div className="flex justify-center w-full align-center">
            <Loading />
          </div>
        )}
        {name && (
          <div
            className={classNames('flex items-start justify-between flex-grow', {
              hidden: isLoading,
            })}
          >
            <div className="flex-grow max-w-full min-w-0 text-sm text-left">{name}</div>
            {showToolbar && (
              <div className="flex flex-row items-center">
                <div className="flex items-center gap-x-1 mt-0.5">
                  <OpacityControl opacity={opacity} onChange={onChangeOpacity} />
                  {info && <InfoToolTip icon="outline" info={info} />}
                </div>
              </div>
            )}
          </div>
        )}
        {comparison && (
          <div className="flex flex-row text-sm w-fit">
            <button
              className={classNames(
                COMMON_MODE_BUTTON_CLASSNAMES,
                'rounded-l-md',
                comparison === 'absolute' ? ACTIVE_BUTTON_CLASSNAMES : DISABLED_BUTTON_CLASSNAMES,
                {
                  'border-r-0': comparison !== 'absolute',
                },
              )}
              type="button"
              onClick={handleChangeComparison('absolute')}
            >
              absolute
            </button>
            <button
              type="submit"
              className={classNames(
                COMMON_MODE_BUTTON_CLASSNAMES,
                'rounded-r-md',
                comparison === 'relative' ? ACTIVE_BUTTON_CLASSNAMES : DISABLED_BUTTON_CLASSNAMES,
                {
                  'border-l-0': comparison !== 'relative',
                },
              )}
              onClick={handleChangeComparison('relative')}
            >
              relative
            </button>
          </div>
        )}
        {!isLoading && children && (
          <div className="flex flex-row gap-2 text-gray-500">
            <div className="flex-grow min-w-0">{children}</div>
            <div className="-mt-0.5 w-8 text-2xs">{unit && <>({unit})</>}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegendItem;
