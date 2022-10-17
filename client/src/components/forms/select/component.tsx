import { forwardRef, useCallback, useState } from 'react';
import classnames from 'classnames';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
import { flip, useFloating } from '@floating-ui/react-dom';

import Hint from '../hint';

import type { SelectProps, Option } from './types';

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    defaultValue,
    options,
    placeholder = 'Select an option',
    label,
    error,
    showHint,
    ...props
  }) => {
    const { onChange, value, ...selectProps } = props;

    const [selected, setSelected] = useState<Option>(defaultValue);
    const { x, y, reference, floating, strategy } = useFloating({
      middleware: [flip()],
      placement: 'bottom-start',
      strategy: 'fixed',
    });

    const handleChange = useCallback(
      (current: Option) => {
        if (onChange) onChange(current);
        setSelected(current);
      },
      [onChange],
    );

    return (
      <Listbox value={selected} onChange={handleChange} {...selectProps}>
        {({ open }) => (
          <>
            {!!label && (
              <Listbox.Label className="block text-sm font-medium text-gray-700">
                {label}
              </Listbox.Label>
            )}
            <div className="relative">
              <Listbox.Button
                className={classnames(
                  'relative py-2 pl-3 pr-10 text-left bg-white border rounded-md shadow-sm cursor-default focus:border-navy-400 focus:outline-none focus:ring-0',
                  {
                    'mt-1': !!label,
                    'border-red-400': error,
                    'border-gray-200': !error,
                  },
                )}
                ref={reference}
              >
                <span className="block text-sm truncate">
                  {selected ? selected.label : <span className="text-gray-200">{placeholder}</span>}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {open ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
                  )}
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as="div"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="z-10"
                style={{
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                }}
                ref={floating}
              >
                <Listbox.Options className="mt-2 overflow-auto text-base bg-white rounded-md shadow-sm max-h-60 ring-1 ring-gray-200 focus:outline-none">
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active }) =>
                        classnames(
                          active && 'bg-navy-50',
                          'relative cursor-default select-none py-2 pl-3 pr-9',
                        )
                      }
                      value={option}
                    >
                      {({ selected }) => (
                        <span
                          className={classnames(
                            selected ? 'text-navy-400' : 'text-gray-900',
                            'block truncate',
                          )}
                        >
                          {option.label}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>

              {showHint && error && typeof error === 'string' && (
                <Hint data-testid={`hint-input-${props.name}`}>{error}</Hint>
              )}
            </div>
          </>
        )}
      </Listbox>
    );
  },
);

Select.displayName = 'Select';

export default Select;
