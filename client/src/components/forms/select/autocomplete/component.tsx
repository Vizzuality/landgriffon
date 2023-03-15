import { cloneElement, useCallback, useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { Transition, Combobox } from '@headlessui/react';
import { ChevronUpIcon, ChevronDownIcon, XIcon } from '@heroicons/react/solid';
import { flip, useFloating, size, autoUpdate, offset } from '@floating-ui/react-dom';
import { FloatingPortal } from '@floating-ui/react';
import { List as VirtualizedList } from 'react-virtualized';

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
  const [virtualizedListWidth, setVirtualizedListWidth] = useState(0);
  const [selected, setSelected] = useState<Option<T> | Option<string>>(
    defaultValue || value || { label: '', value: '' },
  );
  const [query, setQuery] = useState('');
  const { x, y, reference, floating, strategy } = useFloating<HTMLButtonElement>({
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

  const renderOption = useCallback(
    ({ index, key, style }) => {
      return (
        <Combobox.Option
          key={key}
          style={style}
          className={({ active, disabled }) =>
            classnames(
              'relative cursor-default text-sm select-none py-2 pl-3 pr-9 hover:cursor-pointer',
              {
                'bg-navy-50': active,
                'pointer-events-none cursor-default': disabled,
              },
            )
          }
          value={filteredOptions[index]}
          disabled={filteredOptions[index].disabled}
          data-testid={`${props.id || props.name || props['data-testid']}-option`}
        >
          {({ selected, disabled }) => (
            <div
              className={classnames('block truncate text-gray-900', {
                'text-navy-400': selected,
                'text-gray-300': disabled,
              })}
            >
              {filteredOptions[index].label}
            </div>
          )}
        </Combobox.Option>
      );
    },
    [filteredOptions, props],
  );

  const clearSelection = useCallback(() => {
    setSelected(null);
    setQuery('');

    if (onClearSelection) onClearSelection();
  }, [onClearSelection]);

  const virtualizedListHeight = useMemo(() => {
    if (!filteredOptions.length) return rowHeight;
    return filteredOptions.length * rowHeight < 240 ? filteredOptions.length * rowHeight : 240;
  }, [filteredOptions, rowHeight]);

  const isEmptySelection = useMemo(
    () => selected === null || selected?.value === null || selected?.value === '',
    [selected],
  );

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
              <Combobox.Label className="block text-sm font-medium text-gray-700">
                {label}
              </Combobox.Label>
            )}
            <div className="relative w-full overflow-hidden">
              <Combobox.Input<'input', Option<T>>
                className={classnames(
                  'w-full inline-flex items-center py-2.5 pl-3 text-left leading-5',
                  'border rounded-md shadow-sm cursor-default hover:cursor-pointer focus:border-navy-400 focus:outline-none focus:ring-0',
                  'disabled:bg-gray-300/20 disabled:cursor-default text-sm truncate',
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
                displayValue={(option) => option?.label}
                ref={reference}
              />
              <Combobox.Button className="absolute inset-0 flex items-center w-full pr-10" as="div">
                {icon && <div className="mr-2">{cloneElement(icon)}</div>}
                <div className="absolute right-4">
                  {open && !loading && (
                    <div className="flex items-center gap-1">
                      {!isEmptySelection && clearable && (
                        <button type="button" onClick={clearSelection}>
                          <XIcon
                            className={classnames('w-4 h-4', theme === 'dark' && 'text-white')}
                          />
                        </button>
                      )}
                      <ChevronUpIcon
                        className={classnames('w-4 h-4', {
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
                            className={classnames('w-4 h-4', theme === 'dark' && 'text-white')}
                          />
                        </button>
                      )}
                      <ChevronDownIcon
                        className={classnames('w-4 h-4', {
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
                      className={classnames('w-4 h-4 text-navy-400', {
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
                className="z-50"
                style={{
                  position: strategy,
                  top: y ?? 0,
                  left: x ?? 0,
                }}
                ref={floating}
              >
                <Combobox.Options>
                  <VirtualizedList
                    className="w-full overflow-auto text-base bg-white rounded-md shadow-sm max-h-60 ring-1 ring-gray-200 focus:outline-none"
                    width={virtualizedListWidth}
                    height={virtualizedListHeight}
                    rowCount={filteredOptions.length}
                    rowHeight={rowHeight}
                    rowRenderer={renderOption}
                    noRowsRenderer={() => (
                      <div className="relative px-4 py-2 text-sm text-gray-300 cursor-default select-none">
                        No results
                      </div>
                    )}
                  />
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
