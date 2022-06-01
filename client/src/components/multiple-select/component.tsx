import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';

import Label from 'components/forms/label';
import Checkbox from 'components/forms/checkbox';
import { Transition, Popover } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon, XIcon, SearchIcon } from '@heroicons/react/solid';

import Fuse from 'fuse.js';

import Badge from 'components/badge';
import Loading from 'components/loading';

// types
import type {
  MultipleSelectOption,
  MultipleSelectProps,
  MultipleSelectFilterProps,
} from 'components/multiple-select/types';
import { offset, useFloating } from '@floating-ui/react-dom';

const THEMES = {
  default: {
    label: 'text-sm text-gray-300',
    wrapper:
      'w-full bg-white relative border border-gray-300 rounded-md shadow-sm py-2 pr-10 pl-3 cursor-pointer',
    arrow: 'inset-y-0 right-0 items-center pr-2  text-gray-900',
  },
  'inline-primary': {
    label: 'text-sm truncate text-ellipsis font-bold cursor-pointer px-0 py-0',
    wrapper:
      'border-b-2 border-green-700 max-w-[190px] overflow-x-hidden truncate text-ellipsis text-sm ',
    arrow: '-bottom-3  transform left-1/2 -translate-x-1/2 text-green-700',
  },
};

const SEARCH_OPTIONS = {
  includeScore: false,
  keys: ['label'],
  threshold: 0.4,
};

const MultipleSelect: React.FC<MultipleSelectFilterProps> = ({
  current,
  loading = false,
  maxBadges = 5,
  options = [],
  placeholder,
  searchPlaceholder = 'Search',
  showSearch = true,
  onChange,
  onSearch,
  theme = 'default',
  ellipsis = false,
  error = false,
  fitContent = false,
}) => {
  const wrapperRef = useRef();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selected, setSelected] = useState<MultipleSelectOption[]>(null);
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    refs: { reference: referenceElement },
  } = useFloating({
    placement: 'bottom-start',
    middleware: [offset({ mainAxis: 4 })],
  });

  // Selection for non-multiple
  const handleSelect: MultipleSelectProps['onSelect'] = useCallback(
    (selection) => {
      const position = selectedKeys.indexOf(selection.currentTarget.value);
      let updatedSelection;
      if (position === -1) {
        updatedSelection = [...selectedKeys, selection.currentTarget.name];
        setSelectedKeys(updatedSelection);
      } else {
        updatedSelection = selectedKeys.filter((key) => key !== selection.currentTarget.name);
        setSelectedKeys(updatedSelection);
      }
      const selected = options.filter(function (option) {
        return updatedSelection.indexOf(option.label) >= 0;
      });

      setSelected(selected);
      if (onChange) onChange(selected);
    },
    [onChange, options, selectedKeys],
  );

  // Search capability
  const fuse = useMemo(() => new Fuse(options, SEARCH_OPTIONS), [options]);
  const handleSearch = useCallback(
    (e) => {
      setSearchTerm(e.currentTarget.value);
      if (onSearch) onSearch(e.currentTarget.value);
    },
    [onSearch],
  );

  const resetSearch = useCallback(() => setSearchTerm(''), []);

  const optionsResult: MultipleSelectProps['options'] = useMemo(() => {
    if (searchTerm && searchTerm !== '') {
      // TO-DO: investigate if there is a better way for nesting search and Fuse.js
      return fuse.search(searchTerm).map(({ item }) => {
        return {
          ...item,
        };
      });
    }
    return options;
  }, [fuse, options, searchTerm]);

  const handleRemoveBadget = useCallback(
    (option) => {
      const filteredKeys = selected.filter((key) => option.label !== key.label);
      if (onChange) onChange(filteredKeys);
    },
    [onChange, selected],
  );

  // Current selection
  useEffect(() => {
    // Clear selection when current is empty
    if (current && current.length === 0) {
      setSelected(null);
      setSelectedKeys([]);
    }
    if (current && current.length) {
      const currentKeys = current.map(({ label }) => label);
      setSelected(current);
      setSelectedKeys(currentKeys);
    }
  }, [current, selected]);

  return (
    <Popover ref={wrapperRef} className="relative">
      {({ open }) => (
        <>
          <Popover.Button ref={reference} className="w-full align-center relative">
            <div
              className={classNames('flex', THEMES[theme].wrapper, {
                'ring-green-700 border-green-700': open,
                'border-red-600': !!error,
              })}
            >
              {selected &&
                !!selected.length &&
                !ellipsis &&
                selected.slice(0, maxBadges).map((option) => (
                  <Badge
                    key={option.value}
                    className={classNames('m-0.5', THEMES[theme].label)}
                    data={option}
                    onClick={handleRemoveBadget}
                    removable={theme === 'inline-primary' ? false : true}
                    theme={theme}
                  >
                    {option.label}
                  </Badge>
                ))}
              {selected && !!selected.length && ellipsis && (
                <Badge
                  key={selected[0].value}
                  className={classNames('m-0.5', THEMES[theme].label)}
                  data={selected[0]}
                  onClick={handleRemoveBadget}
                  removable={theme === 'inline-primary' ? false : true}
                  theme={theme}
                >
                  {selected[0].label}
                </Badge>
              )}
              {selected && selected.length > maxBadges && (
                <Badge className={classNames('m-0.5', THEMES[theme].label)} theme={theme}>
                  {selected.length - maxBadges} more selected
                </Badge>
              )}
              {(!selected || selected.length === 0) && (
                <span className="inline-block truncate">
                  {placeholder && <span className={THEMES[theme].label}>{placeholder}</span>}
                </span>
              )}
            </div>
            <span
              className={classNames('absolute flex pointer-events-none', THEMES[theme].arrow, {
                'text-red-700': !!error,
              })}
            >
              {open ? (
                <ChevronUpIcon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
          </Popover.Button>
          <div
            style={{
              position: strategy,
              top: y ?? '',
              left: x ?? '',
              width:
                fitContent && reference
                  ? (referenceElement.current as HTMLElement)?.offsetWidth
                  : 'inherit',
            }}
            className="z-10"
            ref={floating}
          >
            <Transition
              show={open}
              enter="transition duration-100 ease-out"
              enterFrom="transform opacity-0"
              enterTo="transform opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform opacity-100"
              leaveTo="transform opacity-0"
            >
              <Popover.Panel
                static
                className={classNames(
                  'z-20 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 max-h-80 overflow-y-auto',
                  fitContent ? 'max-w-full' : 'max-w-md',
                )}
              >
                {loading && (
                  <div className="p-4">
                    <Loading className="text-green-700 -ml-1 mr-3" />
                  </div>
                )}
                {!loading && showSearch && (
                  <div className="flex items-center border-b border-b-gray-400">
                    <div className="pl-2 py-1">
                      <SearchIcon className="block h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="search"
                      value={searchTerm}
                      placeholder={searchPlaceholder}
                      className="block text-sm border-0 rounded-t-md focus:ring-0 focus:border-green-700 flex-1"
                      onChange={handleSearch}
                    />
                    {searchTerm && (
                      <button type="button" onClick={resetSearch} className="px-2 py-1">
                        <XIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                )}

                {!loading &&
                  optionsResult.map((option) => (
                    <div
                      key={option.label}
                      className="flex items-center space-x-2 py-2 px-4 whitespace-nowrap text-sm cursor-pointer hover:bg-green-50 hover:text-green-700"
                    >
                      <Checkbox
                        id={option.label}
                        name={option.label}
                        value={option.value}
                        checked={!!selected?.find((s) => s.value === option.value)}
                        onChange={handleSelect}
                      />
                      <Label htmlFor={option.label} className="ml-2 mt-1 first-letter:uppercase">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                {optionsResult.length === 0 && searchTerm && (
                  <div className="p-2 text-sm">No results</div>
                )}
              </Popover.Panel>
            </Transition>
          </div>
        </>
      )}
    </Popover>
  );
};

export default MultipleSelect;
