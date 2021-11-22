import { Fragment, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import classNames from 'classnames';

import Loading from 'components/loading';

import type { SelectProps } from './types';

const ScenariosComparison: React.FC<SelectProps> = (props: SelectProps) => {
  const {
    disabled = false,
    label,
    options,
    current = options[0],
    loading = false,
    onChange,
  } = props;
  const [selected, setSelected] = useState(current);

  useEffect(() => {
    if (selected && onChange) onChange(selected);
  }, [selected, onChange]);

  useEffect(() => {
    if (!selected) setSelected(options[0]);
  }, [options, selected]);

  return (
    <Listbox value={selected} onChange={setSelected} disabled={disabled}>
      {({ open }) => (
        <>
          <div className="mt-1 relative">
            <Listbox.Button
              className="bg-white relative w-full flex align-center border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default
              focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 text-sm cursor-pointer"
            >
              {loading ? (
                <Loading className="text-green-700" />
              ) : (
                <>
                  {label && (
                    <span className="inline-block truncate mr-1 text-gray-400">{label}</span>
                  )}
                  <span className="inline-block truncate">{selected?.label}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    {open ? (
                      <ChevronUpIcon className="h-4 w-4 text-gray-900" aria-hidden="true" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-gray-900" aria-hidden="true" />
                    )}
                  </span>
                </>
              )}
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options
                static
                className="absolute z-10 mt-1 w-48 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm"
              >
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      classNames(
                        active ? 'text-white bg-green-700' : 'text-gray-900',
                        'cursor-pointer select-none relative py-2 pl-3 pr-9',
                      )
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? 'font-semibold' : 'font-normal',
                            'block text-sm truncate',
                          )}
                        >
                          {option.label}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-green-700',
                              'absolute inset-y-0 right-0 flex items-center pr-4',
                            )}
                          >
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export default ScenariosComparison;
