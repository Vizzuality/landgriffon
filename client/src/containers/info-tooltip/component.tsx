import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/solid';

import Tooltip from 'components/tooltip';

import { InfoTooltipProps } from './types';

export const InfoToolTip: React.FC<InfoTooltipProps> = ({ ...props }: InfoTooltipProps) => {
  const mergeProps = {
    placement: 'right',
    ...props,
  };

  return (
    <Tooltip {...mergeProps}>
      <InformationCircleIcon className="block h-5 w-5" />
    </Tooltip>
  );
};

export default InfoToolTip;
