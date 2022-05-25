import React from 'react';
import classnames from 'classnames';

import { InformationCircleIcon as Outline } from '@heroicons/react/outline';
import { InformationCircleIcon as Solid } from '@heroicons/react/solid';

import Tooltip from 'components/tooltip';

import type { InfoTooltipProps } from './types';

export const InfoToolTip: React.FC<InfoTooltipProps> = ({
  icon = 'solid',
  info,
  className,
  ...props
}) => {
  return (
    <Tooltip
      content={
        <div className="bg-gray-900 p-4 rounded-md w-52 text-xs text-white text-left">{info}</div>
      }
      className="w-54 text-center"
      theme="dark"
      {...props}
    >
      {icon === 'outline' && (
        <Outline className={classnames(`w-4 h-4 text-gray-900 ${className}`)} />
      )}
      {icon === 'solid' && <Solid className={classnames(`w-4 h-4 text-gray-900 ${className}`)} />}
    </Tooltip>
  );
};

export default InfoToolTip;
