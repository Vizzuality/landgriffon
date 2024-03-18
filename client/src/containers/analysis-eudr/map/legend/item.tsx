import classNames from 'classnames';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';

import { Switch } from '@/components/ui/switch';
import OpacityControl from '@/components/legend/item/opacityControl';
import InfoModal from '@/components/legend/item/info-modal';

import type { FC, PropsWithChildren } from 'react';

type LegendItemProps = {
  title: string;
  content: string;
  description: string;
  source?: string | string[];
  legendConfig?: {
    iconColor?: string;
    items?: { label: string; color: string }[];
    dates?: string[];
  };
  showVisibility?: boolean;
  showSwitcher?: boolean;
  isActive?: boolean;
  changeVisibility?: (active: boolean) => void;
  changeOpacity?: (opacity: number) => void;
};

const LegendItem: FC<PropsWithChildren<LegendItemProps>> = ({
  title,
  content,
  description,
  source,
  children,
  legendConfig = null,
  showVisibility = false,
  showSwitcher = false,
  isActive = true,
  changeVisibility = () => null,
  changeOpacity = () => null,
}) => {
  return (
    <div className="flex space-x-2 p-4">
      <div
        className={classNames('mt-0.5 h-3 w-3 shrink-0', 'border-2 border-navy-400 bg-navy-400/30')}
        style={
          legendConfig?.iconColor
            ? { backgroundColor: legendConfig.iconColor, border: 0 }
            : undefined
        }
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between space-x-2">
          <h3 className="text-xs font-normal">{title}</h3>
          <div className="flex divide-x">
            <div className="flex items-center space-x-1 pr-1">
              <OpacityControl opacity={1} onChange={changeOpacity} />
              <InfoModal info={{ title, description: content, source }} />
            </div>
            {showVisibility && (
              <div className="flex items-center pl-1">
                <button
                  type="button"
                  onClick={() => changeVisibility(!isActive)}
                  className="cursor-pointer"
                >
                  {isActive ? (
                    <EyeOffIcon className="h-4 w-4"></EyeOffIcon>
                  ) : (
                    <EyeIcon className="h-4 w-4"></EyeIcon>
                  )}
                </button>
              </div>
            )}
            {showSwitcher && (
              <div className="flex items-center pl-1">
                <Switch checked={isActive} onCheckedChange={changeVisibility} />
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
        {legendConfig?.items?.length > 0 && (
          <ul className="space-y-1">
            {legendConfig?.items?.map((item) => (
              <li key={item.label} className="flex items-start space-x-2 text-xs text-gray-500">
                <div className="h-3 w-3 shrink-0" style={{ backgroundColor: item.color }} />
                <div>{item.label}</div>
              </li>
            ))}
          </ul>
        )}
        {children}
      </div>
    </div>
  );
};

export default LegendItem;
