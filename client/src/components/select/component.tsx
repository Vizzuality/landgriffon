import { Fragment, useCallback, useEffect, useState, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import Fuse from 'fuse.js';

import Loading from 'components/loading';

import type { SelectProps } from './types';

const SEARCH_OPTIONS = {
  includeScore: false,
  keys: ['label'],
  threshold: 0.8,
};

const ScenariosComparison: React.FC<SelectProps> = (props: SelectProps) => {
  const {
    showSearch = false,
    disabled = false,
    label,
    options = [],
    current = options[0],
    loading = false,
    onChange,
    onSearch,
  } = props;
  const [selected, setSelected] = useState(current);
  const [searchQuery, setSearchQuery] = useState(null);

  const handleSearch = useCallback(
    (e) => {
      setSearchQuery(e.currentTarget.value);
      if (onSearch) onSearch(e.currentTarget.value);
    },
    [onSearch],
  );
  const fuse = useMemo(() => new Fuse(options, SEARCH_OPTIONS), [options]);

  useEffect(() => {
    if (selected && onChange) onChange(selected);
  }, [selected, onChange]);

  useEffect(() => {
    if (!selected) setSelected(options[0]);
  }, [options, selected]);

  useEffect(() => {
    if (current) setSelected(current);
  }, [current]);

  const optionsResult = useMemo(() => {
    if (searchQuery) {
      return fuse.search(searchQuery).map(({ item }) => item);
    }
    return options;
  }, [fuse, options, searchQuery]);

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
                className={classNames(
                  'absolute z-20 mt-1 min-w-min w-full bg-white shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none text-sm',
                  {
                    'py-1': !showSearch,
                    'py-0': showSearch,
                  },
                )}
              >
                {showSearch && (
                  <input
                    type="search"
                    placeholder="Search"
                    className="w-full focus:ring-0 focus:border-green-700 block text-sm border-0 border-b border-gray-300 rounded-t-md"
                    onChange={handleSearch}
                  />
                )}
                {optionsResult.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active, selected }) =>
                      classNames(
                        active ? 'bg-green-50 text-green-700' : 'text-gray-900',
                        selected && 'bg-green-50 text-green-700',
                        'cursor-pointer select-none relative py-2 pl-4 pr-4',
                      )
                    }
                    value={option}
                  >
                    {({ selected }) => (
                      <span
                        className={classNames(
                          selected ? 'font-semibold' : 'font-normal',
                          'block text-sm truncate',
                        )}
                      >
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
  );
};

export default ScenariosComparison;
