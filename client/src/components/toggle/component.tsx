import { useCallback } from 'react';
import { Switch } from '@headlessui/react';
import classNames from 'classnames';

import type { MouseEventHandler } from 'react';

type ToggleProps = {
  active: boolean;
  onChange?: (active: boolean) => void;
  disabled?: boolean;
};

/**
 * Prevents the event from propagating. For example, if there's a toggle inside an Accordion header
 */
const handleClick: MouseEventHandler = (e) => {
  e.stopPropagation();
};

const Toggle: React.FC<ToggleProps> = ({ active, onChange, disabled = false }) => {
  const handleChange = useCallback(
    (status: boolean) => {
      onChange?.(status);
    },
    [onChange],
  );

  return (
    <Switch
      checked={active}
      onChange={handleChange}
      className="peer relative inline-flex h-5 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none disabled:cursor-default"
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled}
      data-testid="switch-button"
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute h-full w-full rounded-md bg-none"
      />
      <span
        aria-hidden="true"
        className={classNames(
          'pointer-events-none absolute mx-auto h-3.5 w-7 rounded-full transition-colors duration-200 ease-in-out',
          {
            'bg-gray-200/50': disabled,
            'bg-navy-400': active && !disabled,
            'bg-gray-300': !active && !disabled,
          },
        )}
      />
      <span
        aria-hidden="true"
        className={classNames(
          active ? 'translate-x-4' : 'translate-x-0',
          'pointer-events-none absolute left-0 inline-block h-4 w-4 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out',
        )}
      />
    </Switch>
  );
};

export default Toggle;
