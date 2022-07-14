import { useCallback, useState } from 'react';
import { Switch } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

type ToggleProps = {
  defaultActive?: boolean;
  onChange?: (active: boolean) => void;
};

const Toggle: React.FC<ToggleProps> = ({ defaultActive = false, onChange }) => {
  const [enabled, setEnabled] = useState<boolean>(defaultActive);

  const handleChange = useCallback(
    (status: boolean) => {
      setEnabled(status);
      if (onChange) onChange(status);
    },
    [onChange],
  );

  return (
    <Switch
      checked={enabled}
      onChange={handleChange}
      className="flex-shrink-0 group relative rounded-full inline-flex items-center justify-center h-5 w-8 cursor-pointer focus:outline-none"
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bg-none w-full h-full rounded-md"
      />
      <span
        aria-hidden="true"
        className={classNames(
          enabled ? 'bg-primary' : 'bg-gray-200',
          'pointer-events-none absolute h-3.5 w-7 mx-auto rounded-full transition-colors ease-in-out duration-200',
        )}
      />
      <span
        aria-hidden="true"
        className={classNames(
          enabled ? 'translate-x-4' : 'translate-x-0',
          'pointer-events-none absolute left-0 inline-block h-4 w-4 border border-gray-200 rounded-full bg-white shadow transform ring-0 transition-transform ease-in-out duration-200',
        )}
      />
    </Switch>
  );
};

export default Toggle;
