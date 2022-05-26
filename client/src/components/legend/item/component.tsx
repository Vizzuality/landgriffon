import { useCallback, useEffect, useState } from 'react';

import { useMetadataLayerInfo } from 'hooks/metadata-info';

import Toggle from 'components/toggle';
import Loading from 'components/loading';
import OpacityControl from './opacityControl';
import DragHandle from './dragHandle';
import InfoToolTip from 'containers/info-tooltip/component';
import classNames from 'classnames';

export type LegendItemProps = {
  name: string | JSX.Element;
  unit: string;
  id: string;
  description?: string;
  active?: boolean;
  isLoading?: boolean;
  showToolbar?: boolean;
  children?: React.ReactNode;
  onActiveChange: (active: boolean) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  main?: boolean;
};

export const LegendItem: React.FC<LegendItemProps> = ({
  name,
  unit,
  id,
  active = false,
  isLoading = false,
  showToolbar = true,
  children,
  onActiveChange,
  opacity,
  onChangeOpacity,
  main = false,
}) => {
  const [isActive, setActive] = useState<boolean>(active);
  const handleChange = useCallback(
    (active) => {
      setActive(active);
      if (onActiveChange) onActiveChange(active);
    },
    [onActiveChange],
  );

  useEffect(() => {
    setActive(active);
  }, [active]);

  const info = useMetadataLayerInfo();

  return (
    <div className={classNames('pr-4 py-4 space-y-4 group', { 'bg-gray-50': !main })}>
      {isLoading && <Loading />}
      {!isLoading && name && (
        <div className="w-full flex">
          <div className="grow flex items-start justify-between">
            <div className="max-w-[210px] text-sm text-gray-500 flex flex-row justify-start gap-x-1">
              <div className="invisible group-hover:visible pl-1 pr-0.5">
                <DragHandle />
              </div>
              <div>{name}</div>
            </div>
            {showToolbar && (
              <div className="flex items-center">
                <div className="flex items-center space-x-1 mt-0.5">
                  <OpacityControl opacity={opacity} onChange={onChangeOpacity} />
                  <InfoToolTip icon="outline" info={info[id]} />
                </div>
              </div>
            )}
          </div>
          <div className="ml-1 w-8">
            <Toggle defaultActive={isActive} onChange={handleChange} />
          </div>
        </div>
      )}
      {!isLoading && isActive && children && (
        <div className="flex ml-2">
          <div className="flex-1">{children}</div>
          {unit && <div className="w-8 text-xs text-gray-500 -m-1">{unit}</div>}
        </div>
      )}
    </div>
  );
};

export default LegendItem;
