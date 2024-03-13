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
  iconClassName?: string;
  iconColor?: string;
  showVisibility?: boolean;
  showSwitcher?: boolean;
  isActive?: boolean;
};

const LegendItem: FC<PropsWithChildren<LegendItemProps>> = ({
  title,
  content,
  description,
  source,
  children,
  iconClassName,
  iconColor,
  showVisibility = false,
  showSwitcher = false,
  isActive = true,
}) => {
  return (
    <div className="flex space-x-2 p-4">
      <div
        className={classNames(
          'mt-0.5 h-3 w-3 shrink-0',
          iconClassName ?? 'border-2 border-gray-500 bg-gray-500/30',
        )}
        style={iconColor ? { backgroundColor: iconColor, border: 0 } : undefined}
      />
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between space-x-2">
          <h3 className="text-xs font-normal">{title}</h3>
          <div className="flex divide-x">
            <div className="flex items-center space-x-1 pr-1">
              <OpacityControl opacity={1} onChange={() => null} />
              <InfoModal info={{ title, description: content, source }} />
            </div>
            {showVisibility && (
              <div className="flex items-center pl-1">
                <button type="button" onClick={() => null}>
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
                <Switch />
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
        {children}
      </div>
    </div>
  );
};

export default LegendItem;
