import { Fragment, forwardRef, useState } from 'react';
import classnames from 'classnames';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';

import type { SelectProps, Option } from './types';

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ defaultValue, options, placeholder = 'Select an option', ...props }) => {
  const [selected, setSelected] = useState<Option>(defaultValue);
  const { onChange, value, ...selectProps } = props;

  return (
    <Listbox value={selected} onChange={setSelected} {...selectProps} >
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium text-gray-700">Assigned to</Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-200 rounded-md shadow-sm cursor-default focus:border-navy-400 focus:outline-none focus:ring-0">
              <span className="block text-sm truncate">{selected ? selected.label : placeholder}</span>
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
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      classnames(
                        active && 'bg-navy-50',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={option}
                  >
                    {({ selected }) => (
                      <span className={classnames(selected ? 'text-navy-400' : 'text-gray-900', 'block truncate')}>
                        {option.label}
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
});

Select.displayName = 'Select';

export default Select;
