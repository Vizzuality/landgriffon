import { cloneElement, useCallback, useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';
import { flip, useFloating, size } from '@floating-ui/react-dom';
import { autoUpdate } from '@floating-ui/react';
import { isArray, sortBy } from 'lodash-es';

import Hint from '../hint';

import Loading from 'components/loading';
import Badge from 'components/badge';

import type { Option, SelectProps } from './types';

const Select = <T,>({
  value,
  defaultValue,
  error,
  icon,
  label,
  loading = false,
  options,
  placeholder = 'Select an option',
  showHint,
  onChange,
  multiple,
  theme = 'light',
  ...props
}: SelectProps<T>) => {
  const [selected, setSelected] = useState<Option<T> | Option<string> | Option<T>[]>(() => {
    if (multiple && !value) {
      return [];
    }
    if (defaultValue) return defaultValue;
    if (value) return value;

    return { label: '', value: '' };
  });
  const { x, y, reference, floating, strategy } = useFloating<HTMLButtonElement>({
    middleware: [
      flip(),
      size({
        apply({ elements }) {
          const referenceWidth = elements.reference.getBoundingClientRect().width;
          const floatingWidth = elements.floating.getBoundingClientRect().width;

          Object.assign(elements.floating.style, {
            width: `${floatingWidth > referenceWidth ? floatingWidth : referenceWidth}px`,
          });
        },
      }),
    ],
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
  });

  const handleChange = useCallback(
    (current: Parameters<typeof onChange>[0]) => {
      onChange?.(current);
      setSelected(current);
    },
    [onChange],
  );

  const handleDelete = useCallback(
    (option: Option<T>) => {
      if (isArray(selected)) {
        const newSelected = selected.filter(({ value }) => option.value !== value);
        setSelected(newSelected);
        onChange?.(newSelected);
      }
    },
    [selected, onChange],
  );

  // ? in case the value is not set in the hook initialization, it will be set here after first render.
  useEffect(() => {
    if (value) setSelected(value);
  }, [value]);

  const labelSelect = useMemo(() => {
    if (isArray(selected) && selected?.[0]?.label) {
      return (
        <div className="flex flex-wrap gap-2">
          {(sortBy(selected, ['label']) as Option<T>[] | Option<string>[]).map((option) => (
            <Badge
              key={`tree-select-badge-${option.value}`}
              removable
              onClick={() => handleDelete(option)}
              theme="big"
              className="text-xs"
            >
              {option.label}
            </Badge>
          ))}
        </div>
      );
    }

    if (!isArray(selected) && selected?.label) {
      return selected.label;
    }

    return (
      <span
        className={classnames('text-gray-500', {
          'inline-block pl-2': multiple,
        })}
      >
        {placeholder}
      </span>
    );
  }, [selected, multiple, placeholder, handleDelete]);

  return (
    <div data-testid={`select-${props.id || props.name || props['data-testid']}`}>
      <Listbox
        by="value"
        value={selected}
        onChange={handleChange}
        disabled={props.disabled || loading}
        multiple={multiple}
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
                'relative w-full min-h-[42px] inline-flex items-center text-left leading-5 border rounded-md shadow-sm cursor-default hover:cursor-pointer focus:outline-none focus:ring-0 disabled:bg-gray-300/20 disabled:cursor-default',
                {
                  'bg-white focus:border-navy-400': theme === 'light',
                  'bg-navy-400 text-white placeholder:text-white focus:bg-navy-600':
                    theme === 'dark',
                  'py-2.5 pl-3 pr-10': !multiple,
                  'py-1 pl-1 pr-10': multiple,
                  'mt-1': !!label,
                  'border-red-400': error,
                  'border-gray-200': theme === 'light' && !error,
                  'border-navy-400': theme === 'dark' && !error,
                },
              )}
              ref={reference}
            >
              {icon && <div className="mr-2">{cloneElement(icon)}</div>}
              <span className="min-h-full block text-sm truncate">{labelSelect}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                {open && !loading && (
                  <ChevronUpIcon
                    className={classnames('w-4 h-4', {
                      'text-gray-300': props.disabled,
                      'text-gray-900': theme === 'light',
                      'text-white': theme === 'dark',
                    })}
                    aria-hidden="true"
                  />
                )}
                {!open && !loading && (
                  <ChevronDownIcon
                    className={classnames('w-4 h-4', {
                      'text-gray-300': props.disabled,
                      'text-gray-900': theme === 'light',
                      'text-white': theme === 'dark',
                    })}
                    aria-hidden="true"
                  />
                )}
                {loading && (
                  <Loading
                    className={classnames('w-4 h-4 text-navy-400', {
                      'text-navy-400': theme === 'light',
                      'text-white': theme === 'dark',
                    })}
                  />
                )}
              </span>
            </Listbox.Button>
            <Transition
              show={open}
              as="div"
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
              className="z-50"
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
                    className={({ active, disabled }) =>
                      classnames(
                        'relative cursor-default text-sm select-none py-2 pl-3 pr-9 hover:cursor-pointer',
                        {
                          'bg-navy-50': active,
                          'pointer-events-none cursor-default': disabled,
                        },
                      )
                    }
                    value={option}
                    disabled={option.disabled}
                  >
                    {({ selected, disabled }) => (
                      <div
                        className={classnames('block truncate', {
                          'text-navy-400': selected,
                          'text-gray-300': disabled,
                          'text-gray-900': !selected && !disabled,
                        })}
                      >
                        {option.label}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>

            {showHint && error && typeof error === 'string' && (
              <Hint data-testid={`hint-input-${props.name}`}>{error}</Hint>
            )}
          </>
        )}
      </Listbox>
    </div>
  );
};

Select.displayName = 'Select';

export default Select;
