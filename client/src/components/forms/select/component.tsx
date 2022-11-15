import { cloneElement, forwardRef, useCallback, useEffect, useState } from 'react';
import classnames from 'classnames';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
import { flip, useFloating } from '@floating-ui/react-dom';
import { FloatingPortal } from '@floating-ui/react-dom-interactions';

import Hint from '../hint';

import Loading from 'components/loading';

import type { SelectProps, Option } from './types';

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    defaultValue,
    error,
    icon,
    label,
    loading = false,
    options,
    placeholder = 'Select an option',
    showHint,
    ...props
  }) => {
    const { onChange, value, ...selectProps } = props;

    const [selected, setSelected] = useState<Option>(defaultValue || value);
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

    useEffect(() => setSelected(value), [value]);

    return (
      <div data-testid={`select-${props.id || props.name || props['data-testid']}`}>
        <Listbox
          by="value"
          value={selected}
          onChange={handleChange}
          {...selectProps}
          disabled={props.disabled || loading}
        >
          {({ open }) => (
            <>
              {!!label && (
                <Listbox.Label className="block text-sm font-medium text-gray-700">
                  {label}
                </Listbox.Label>
              )}
              <Listbox.Button
                className={classnames(
                  'relative w-full inline-flex items-center py-2.5 pl-3 pr-10 text-left leading-5 bg-white border rounded-md shadow-sm cursor-default hover:cursor-pointer focus:border-navy-400 focus:outline-none focus:ring-0',
                  {
                    'mt-1': !!label,
                    'border-red-400': error,
                    'border-gray-200': !error,
                  },
                )}
                ref={reference}
              >
                {icon && <div className="mr-2">{cloneElement(icon)}</div>}
                <span className="block text-sm truncate">
                  {selected ? selected.label : <span className="text-gray-200">{placeholder}</span>}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  {open && !loading && (
                    <ChevronUpIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
                  )}
                  {!open && !loading && (
                    <ChevronDownIcon className="w-5 h-5 text-gray-900" aria-hidden="true" />
                  )}
                  {loading && <Loading className="w-4 h-4 text-navy-400" />}
                </span>
              </Listbox.Button>
              <FloatingPortal>
                <Transition
                  show={open}
                  as="div"
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
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
                        key={`option-item-${option.value}`}
                        className={({ active }) =>
                          classnames(
                            active && 'bg-navy-50',
                            'relative cursor-default text-sm select-none py-2 pl-3 pr-9 hover:cursor-pointer',
                          )
                        }
                        value={option}
                      >
                        {({ selected }) => (
                          <div
                            className={classnames(
                              selected ? 'text-navy-400' : 'text-gray-900',
                              'block truncate',
                            )}
                          >
                            {option.label}
                          </div>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </FloatingPortal>

              {showHint && error && typeof error === 'string' && (
                <Hint data-testid={`hint-input-${props.name}`}>{error}</Hint>
              )}
            </>
          )}
        </Listbox>
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
