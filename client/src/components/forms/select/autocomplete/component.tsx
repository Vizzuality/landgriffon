import React, { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import { Transition, Combobox } from '@headlessui/react';
import { ChevronUpIcon, ChevronDownIcon, XIcon } from '@heroicons/react/solid';
import { flip, useFloating, size, autoUpdate, offset } from '@floating-ui/react-dom';
import { FloatingPortal } from '@floating-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';

import Hint from 'components/forms/hint';
import Loading from 'components/loading';

import type { AutoCompleteSelectProps } from './types';
import type { Option } from '../types';
import type { ChangeEvent } from 'react';

const DEFAULT_ROW_HEIGHT = 36;

const AutoCompleteSelect = <T,>({
  value,
  defaultValue,
  error,
  icon,
  label,
  loading = false,
  placeholder = 'Select an option',
  rowHeight = DEFAULT_ROW_HEIGHT,
  options,
  showHint,
  clearable = false,
  theme = 'light',
  onChange,
  onClearSelection,
  onSearch,
  ...props
}: AutoCompleteSelectProps<T>) => {
  const parentRef = useRef();
  const [virtualizedListWidth, setVirtualizedListWidth] = useState(0);
  const [selected, setSelected] = useState<Option<T> | Option<string>>(
    defaultValue || value || { label: '', value: '' },
  );
  const [query, setQuery] = useState('');
  const { x, y, refs, strategy } = useFloating<HTMLButtonElement>({
    middleware: [
      offset(5),
      flip(),
      size({
        apply({ elements }) {
          const { width: referenceWidth } = elements.reference.getBoundingClientRect();
          const { width: floatingWidth } = elements.floating.getBoundingClientRect();

          const finalWidth = floatingWidth > referenceWidth ? floatingWidth : referenceWidth;

          Object.assign(elements.floating.style, {
            width: `${finalWidth}px`,
          });

          setVirtualizedListWidth(finalWidth);
        },
      }),
    ],
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
  });

  const handleChange = useCallback<AutoCompleteSelectProps<T>['onChange']>(
    (current: Option<T>) => {
      if (onChange) onChange(current);
      setSelected(current);
    },
    [onChange],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
      onSearch?.(event.target.value);
    },
    [onSearch],
  );

  const handleAfterTransitionLeave = useCallback(() => setQuery(''), []);

  const filteredOptions = useMemo(
    () =>
      query === ''
        ? options
        : options.filter(({ label }) => label.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  const clearSelection = useCallback(() => {
    setSelected(null);
    setQuery('');

    if (onClearSelection) onClearSelection();
  }, [onClearSelection]);

  const isEmptySelection = useMemo(
    () => selected === null || selected?.value === null || selected?.value === '',
    [selected],
  );

  const virtualizedList = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => rowHeight, [rowHeight]),
    overscan: 10,
  });

  // ? in case the value is not set in the hook initialization, it will be set here after first render.
  useEffect(() => {
    if (value) setSelected(value);
  }, [value]);

  return (
    <div data-testid={`select-${props.id || props.name || props['data-testid']}`}>
      <Combobox
        by="value"
        value={selected}
        onChange={handleChange}
        disabled={props.disabled || loading}
      >
        {({ open }) => (
          <>
            {!!label && (
              <Combobox.Label className="text-gray-700 block text-sm font-medium">
                {label}
              </Combobox.Label>
            )}
            <div className="relative w-full overflow-hidden">
              <Combobox.Input
                className={classnames(
                  'inline-flex w-full items-center py-2.5 pl-3 text-left leading-5',
                  'cursor-default rounded-md border shadow-sm hover:cursor-pointer focus:border-navy-400 focus:outline-none focus:ring-0',
                  'truncate text-sm disabled:cursor-default disabled:bg-gray-300/20',
                  clearable ? 'pr-14' : 'pr-10',
                  {
                    'bg-white placeholder:text-gray-500': theme === 'light',
                    'bg-navy-400 text-white placeholder:text-white focus:bg-navy-600':
                      theme === 'dark',
                    'mt-1': !!label,
                    'border-red-400': error,
                    'border-gray-200': theme === 'light' && !error,
                    'border-navy-400': theme === 'dark' && !error,
                  },
                )}
                onChange={handleInputChange}
                placeholder={placeholder}
                displayValue={(option: Option<T>) => option?.label}
              />
              <Combobox.Button
                className="absolute inset-0 flex w-full items-center pr-10"
                as="div"
                ref={refs.setReference}
              >
                {icon && <div className="mr-2">{cloneElement(icon)}</div>}
                <div className="absolute right-4">
                  {open && !loading && (
                    <div className="flex items-center gap-1">
                      {!isEmptySelection && clearable && (
                        <button type="button" onClick={clearSelection}>
                          <XIcon
                            className={classnames('h-4 w-4', theme === 'dark' && 'text-white')}
                          />
                        </button>
                      )}
                      <ChevronUpIcon
                        className={classnames('h-4 w-4', {
                          'text-gray-900': theme === 'light',
                          'text-white': theme === 'dark',
                          'text-gray-300': props.disabled,
                        })}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  {!open && !loading && (
                    <div className="flex items-center gap-1">
                      {!isEmptySelection && clearable && (
                        <button type="button" onClick={clearSelection}>
                          <XIcon
                            className={classnames('h-4 w-4', theme === 'dark' && 'text-white')}
                          />
                        </button>
                      )}
                      <ChevronDownIcon
                        className={classnames('h-4 w-4', {
                          'text-gray-900': theme === 'light',
                          'text-white': theme === 'dark',
                          'text-gray-300': props.disabled,
                        })}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  {loading && (
                    <Loading
                      className={classnames('h-4 w-4 text-navy-400', {
                        'text-navy-400': theme === 'light',
                        'text-white': theme === 'dark',
                      })}
                    />
                  )}
                </div>
              </Combobox.Button>
            </div>

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
                afterLeave={handleAfterTransitionLeave}
                className="z-50 max-h-60 overflow-auto rounded-md bg-white text-base shadow-sm ring-1 ring-gray-200 focus:outline-none"
                style={{
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                  width: `${virtualizedListWidth}px`,
                }}
                ref={refs.setFloating}
              >
                <Combobox.Options
                  className="relative w-full"
                  style={{
                    height: `${virtualizedList.getTotalSize()}px`,
                  }}
                  ref={parentRef}
                >
                  {virtualizedList.getVirtualItems().map((virtualItem) => (
                    <Combobox.Option
                      key={virtualItem.key}
                      style={{ height: `${virtualItem.size}px` }}
                      className={({ active, disabled }) =>
                        classnames(
                          'relative cursor-default select-none py-2 pl-3 pr-9 text-sm hover:cursor-pointer',
                          {
                            'bg-navy-50': active,
                            'pointer-events-none cursor-default': disabled,
                          },
                        )
                      }
                      value={filteredOptions[virtualItem.index]}
                      disabled={filteredOptions[virtualItem.index].disabled}
                      data-testid={`${props.id || props.name || props['data-testid']}-option`}
                    >
                      {({ selected, disabled }) => (
                        <div
                          className={classnames('block truncate', {
                            'text-navy-400': selected,
                            'text-gray-300': disabled,
                            'text-gray-900': !selected && !disabled,
                          })}
                        >
                          {filteredOptions[virtualItem.index].label}
                        </div>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Transition>
            </FloatingPortal>

            {showHint && error && typeof error === 'string' && (
              <Hint data-testid={`hint-input-${props.name}`}>{error}</Hint>
            )}
          </>
        )}
      </Combobox>
    </div>
  );
};

AutoCompleteSelect.displayName = 'AutoCompleteSelect';

export default AutoCompleteSelect;
