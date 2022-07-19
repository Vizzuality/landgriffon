import Toggle from 'components/toggle';
import Loading from 'components/loading';
import OpacityControl from './opacityControl';
import DragHandle from './dragHandle';
import InfoToolTip from 'containers/info-tooltip/component';
import classNames from 'classnames';

export type LegendItemProps = {
  name: string | JSX.Element;
  info: string;
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
  info,
  unit,
  active = false,
  isLoading = false,
  showToolbar = true,
  children,
  onActiveChange,
  opacity,
  onChangeOpacity,
  main = false,
}) => {
  return (
    <div className={classNames('pr-4 py-4 space-y-4 group', { 'bg-gray-50': !main })}>
      {isLoading && (
        <div className="flex justify-center w-full align-center">
          <Loading />
        </div>
      )}
      {name && (
        <div className={classNames('w-full flex', { hidden: isLoading })}>
          <div className="flex items-start justify-between grow">
            <div className="max-w-[210px] text-sm text-gray-500 flex flex-row justify-start gap-x-1">
              <div className="invisible group-hover:visible pl-1 pr-0.5">
                <DragHandle />
              </div>
              <div className="max-w-full">{name}</div>
            </div>
            {showToolbar && (
              <div className="flex items-center">
                <div className="flex items-center space-x-1 mt-0.5">
                  <OpacityControl opacity={opacity} onChange={onChangeOpacity} />
                  <InfoToolTip icon="outline" info={info} />
                </div>
              </div>
            )}
          </div>
          <div className="w-8 ml-1">
            <Toggle active={active} onChange={onActiveChange} />
          </div>
        </div>
      )}
      {!isLoading && active && children && (
        <div className="flex ml-2">
          <div className="flex-1 w-[90%]">{children}</div>
          {unit && <div className="w-8 -m-1 text-xs text-gray-500">{unit}</div>}
        </div>
      )}
    </div>
  );
};

export default LegendItem;
