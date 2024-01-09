import { ExclamationCircleIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import React from 'react';

import type { ComponentProps } from 'react';

type CalloutType = 'error' | 'warning' | 'info' | 'success';

interface CalloutProps {
  type: Extract<CalloutType, 'error'>;
}

const TYPE_CLASSNAMES: Partial<Record<CalloutType, string>> = {
  error: 'bg-red-50 text-red-400',
};

const ICONS_BY_TYPE: Partial<Record<CalloutType, React.FC<ComponentProps<'svg'>>>> = {
  error: ExclamationCircleIcon,
};

const Callout = ({ type, children }: React.PropsWithChildren<CalloutProps>) => {
  const Icon = ICONS_BY_TYPE[type];
  return (
    <div
      className={classNames('flex flex-row gap-2 rounded-md p-2 text-sm', TYPE_CLASSNAMES[type])}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
};

export default Callout;
