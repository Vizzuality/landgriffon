import { Fragment, useCallback, useEffect, useState, useMemo } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { ChevronUpIcon, XIcon, SearchIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import Fuse from 'fuse.js';

import Loading from 'components/loading';

import type { SelectProps } from './types';

const SEARCH_OPTIONS = {
  includeScore: false,
  keys: ['label'],
  threshold: 0.4,
};

const THEMES = {
  default: {
    base: 'shadow-sm bg-white relative w-full flex align-center py-2 text-left text-sm font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 pl-3 pr-10',
    arrow: 'absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none',
    placeholder: 'text-gray-300',
  },
  'default-bordernone': {
    base: 'inline-block relative pr-6 flex focus:outline-none shadow-none text-gray-500',
    arrow: 'absolute inset-y-0 right-0 flex items-center pointer-events-none',
    placeholder: 'text-gray-300',
  },
  'inline-primary': {
    base: 'relative py-0.5 flex text-sm font-bold border-b-2 border-green-700 max-w-[190px] truncate text-ellipsis',
    arrow: 'absolute -bottom-3 transform left-1/2 -translate-x-1/2 text-green-700',
    placeholder: 'text-green-700',
  },
};

const Select: React.FC<SelectProps> = ({
  disabled = false,
  label,
  options = [],
  current = null,
  allowEmpty = false,
  loading = false,
  placeholder = null,
  searchPlaceholder = 'Search',
  onChange,
  onSearch,
  theme = 'default',
  error = false,
}) => {
  const [selected, setSelected] = useState<SelectProps['current']>(current);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Search capability
  const fuse = useMemo(() => new Fuse(options, SEARCH_OPTIONS), [options]);
  const handleSearch = useCallback(
    (e) => {
      setSearchTerm(e.currentTarget.value);
      onSearch?.(e.currentTarget.value);
    },
    [onSearch],
  );
  const resetSearch = useCallback(() => setSearchTerm(''), []);
  const optionsResult: SelectProps['options'] = useMemo(() => {
    if (searchTerm && searchTerm !== '') {
      return fuse
        .search(searchTerm)
        .filter(({ item }) => !item.disabled)
        .map(({ item }) => item);
    }
    return options;
  }, [fuse, options, searchTerm]);

  // On change
  const handleChange = useCallback(
    (currentOption) => {
      onChange?.(currentOption);
      // setSelected(currentOption);
      resetSearch();
    },
    [onChange, resetSearch],
  );

  // useEffect(() => {
  //   // Update selected when current prop changes
  //   if (allowEmpty && current) {
  //     setSelected(current);
  //   }
  //   // if allowEmpty is false, current is the first option
  //   else if (!allowEmpty && !current) {
  //     setSelected(options[0]);
  //   }
  //   // Fallback to set current as usual
  //   else if (current) {
  //     setSelected(current);
  //   }
  // }, [current, allowEmpty, options]);

  const [firstOptionRef, setFirstOptionRef] = useState<HTMLElement>(null);

  return (
    <Combobox value={current} onChange={handleChange} disabled={disabled}>
      {({ open }) => (
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="text-ellipsis"
              displayValue={(option: SelectProps['current']) => option?.label || ''}
              onChange={handleSearch}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpIcon
                className={classNames('h-4 w-4', { 'rotate-180': open })}
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
            afterLeave={() => {
              setSearchTerm('');
            }}
          >
            <Combobox.Options
              static
              className={classNames(
                'absolute z-20 mt-1 min-w-min w-full bg-white shadow-lg max-h-60 rounded-md ring-1 ring-black ring-opacity-5 overflow-y-auto overflow-x-hidden focus:outline-none text-sm',
              )}
            >
              {optionsResult.map((option, i) => (
                <Combobox.Option
                  key={option.value}
                  className={({ active, selected, disabled }) =>
                    classNames(
                      'z-10',
                      active ? 'bg-green-50 text-green-700' : 'text-gray-900',
                      selected && 'bg-green-50 text-green-700',
                      'cursor-pointer select-none relative py-2 pl-4 pr-4',
                      disabled && 'text-opacity-50 cursor-default',
                    )
                  }
                  disabled={option.disabled}
                  value={option}
                >
                  {({ selected }) => (
                    <div className="flex flex-row gap-x-2" ref={i === 0 ? setFirstOptionRef : null}>
                      <div
                        className={classNames(
                          selected ? 'font-semibold' : 'font-normal',
                          'block text-sm truncate',
                        )}
                      >
                        {option.label}
                      </div>
                      {option.extraInfo && (
                        <div>
                          <i className="text-gray-600 text-sm">{option.extraInfo}</i>
                        </div>
                      )}
                    </div>
                  )}
                </Combobox.Option>
              ))}
              {optionsResult.length === 0 && searchTerm && (
                <div className="p-2 text-sm">No results</div>
              )}
            </Combobox.Options>
          </Transition>
        </div>
      )}
    </Combobox>
  );
};

export default Select;
