import React, { useMemo } from 'react';
import { InformationCircleIcon } from '@heroicons/react/outline';

import Tooltip from 'components/tooltip';

import type { InfoTooltipProps } from './types';

export const InfoToolTip: React.FC<InfoTooltipProps> = ({ info, ...props }) => {
  const TooltipContent = useMemo(
    () => (
      <div className="bg-gray-900 p-4 rounded-md w-52 text-xs text-white text-left">{info}</div>
    ),
    [info],
  );

  return (
    <Tooltip arrow content={TooltipContent} className="w-54 text-center" theme="dark" {...props}>
      <InformationCircleIcon className="w-4 h-4 text-gray-900" />
    </Tooltip>
  );
};

export default InfoToolTip;
