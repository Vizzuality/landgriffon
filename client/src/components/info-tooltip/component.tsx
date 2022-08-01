import React, { useMemo } from 'react';

import { InformationCircleIcon as Outline } from '@heroicons/react/outline';
import { InformationCircleIcon as Solid } from '@heroicons/react/solid';

import Tooltip from 'components/tooltip';

import type { InfoTooltipProps } from './types';

export const InfoToolTip: React.FC<InfoTooltipProps> = ({ icon = 'solid', info, ...props }) => {
  const TooltipContent = useMemo(
    () => (
      <div className="bg-gray-900 p-4 rounded-md w-52 text-xs text-white text-left">{info}</div>
    ),
    [info],
  );

  return (
    <Tooltip arrow content={TooltipContent} className="w-54 text-center" theme="dark" {...props}>
      {icon === 'outline' && <Outline className="w-4 h-4 text-gray-900" />}
      {icon === 'solid' && <Solid className="w-4 h-4 text-gray-900" />}
    </Tooltip>
  );
};

export default InfoToolTip;
