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
      className="relative inline-flex items-center justify-center flex-shrink-0 w-8 h-5 rounded-full cursor-pointer group focus:outline-none disabled:cursor-default"
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className="absolute w-full h-full rounded-md pointer-events-none bg-none"
      />
      <span
        aria-hidden="true"
        className={classNames(
          active && !disabled ? 'bg-navy-400' : 'bg-gray-200',
          'pointer-events-none absolute h-3.5 w-7 mx-auto rounded-full transition-colors ease-in-out duration-200',
        )}
      />
      <span
        aria-hidden="true"
        className={classNames(
          active ? 'translate-x-4' : 'translate-x-0',
          'pointer-events-none absolute left-0 inline-block h-4 w-4 border border-gray-200 rounded-full bg-white shadow transform ring-0 transition-transform ease-in-out duration-200',
        )}
      />
    </Switch>
  );
};

export default Toggle;
