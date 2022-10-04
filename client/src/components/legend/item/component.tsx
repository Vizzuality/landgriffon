import classNames from 'classnames';

import InfoToolTip from 'components/info-tooltip/component';
import Loading from 'components/loading';
import OpacityControl from './opacityControl';
import DragHandle from './dragHandle';

export type LegendItemProps = {
  name: string | JSX.Element;
  info?: string;
  unit?: string;
  id: string;
  description?: string;
  isLoading?: boolean;
  showToolbar?: boolean;
  children?: React.ReactNode;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  main?: boolean;
};

export const LegendItem = ({
  name,
  info,
  unit,
  isLoading = false,
  showToolbar = true,
  children,
  opacity,
  onChangeOpacity,
  main = false,
}: LegendItemProps) => {
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
