import type { Ref } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import type {
  Theme,
  MenuProps,
  ControlProps,
  InputProps,
  SelectComponentsConfig,
  GroupBase,
  StylesConfig,
} from 'react-select';
import ReactSelect, { defaultTheme, components } from 'react-select';
import { ChevronDownIcon } from '@heroicons/react/outline';

import type { UseFuseOptions } from 'hooks/fuse';
import useFuse from 'hooks/fuse';

import Loading from 'components/loading';

import type { SelectOption, SelectProps } from './types';
import { flip, offset, shift, useFloating, autoUpdate } from '@floating-ui/react-dom';
import type SelectClass from 'react-select/dist/declarations/src/Select';

/**
 * Overriding default React Select theme
 * https://react-select.com/styles#overriding-the-theme
 */
const DEFAULT_THEME: Theme = {
  ...defaultTheme,
  borderRadius: 6,
  colors: {
    ...defaultTheme.colors,
    primary: '#078A3C',
    primary25: '#EBF6F1',
  },
  spacing: {
    ...defaultTheme.spacing,
    controlHeight: 40,
  },
};

const getComponents = <
  OptionValue,
  IsMulti extends boolean = false,
  Group extends GroupBase<SelectOption<OptionValue>> = GroupBase<SelectOption<OptionValue>>,
>(
  theme: SelectProps<OptionValue>['theme'],
  error: boolean,
): SelectComponentsConfig<SelectOption<OptionValue>, IsMulti, Group> => {
  return {
    SelectContainer: ({ className, ...props }) => (
      <components.SelectContainer
        {...props}
        className={classNames(className, 'text-sm', {
          'shadow-sm': theme == 'default',
        })}
      />
    ),
    SingleValue: ({ className, ...props }) => (
      <components.SingleValue
        className={classNames(className, 'my-auto', {
          'font-bold text-navy-400': theme === 'inline-primary',
        })}
        {...props}
      />
    ),
    IndicatorsContainer: ({ className, ...props }) => (
      <components.IndicatorsContainer
        className={classNames(className, theme === 'inline-primary' ? 'hidden' : 'ml-2 mr-1 w-min')}
        {...props}
      />
    ),
    IndicatorSeparator: null,
    ValueContainer: ({ className, ...props }) => (
      <components.ValueContainer className={classNames(className, 'px-0')} {...props} />
    ),
    Option: ({ className, children, ...props }) => (
      <components.Option
        {...props}
        className={classNames(
          className,
          'text-gray-900 truncate cursor-pointer hover:bg-green-50',
          props.isFocused ? 'bg-green-50 text-navy-400' : 'text-gray-900',
          {
            'bg-green-50': props.isSelected,
            'text-opacity-50 cursor-default': props.isDisabled,
          },
        )}
      >
        <div className="flex flex-row gap-x-2">
          <div
            className={classNames(
              {
                'font-semibold text-navy-400': props.isSelected,
              },
              'block truncate',
            )}
          >
            {children}
          </div>
          {props.data.extraInfo && (
            <div>
              <span className="text-xs italic text-gray-600">{props.data.extraInfo}</span>
            </div>
          )}
        </div>
      </components.Option>
    ),
    LoadingIndicator: () => <Loading className="text-navy-400" />,
    DropdownIndicator:
      theme === 'default' || theme === 'default-bordernone'
        ? ({ selectProps: { menuIsOpen } }) => (
            <ChevronDownIcon
              className={classNames('h-4 w-4 text-gray-900', {
                'rotate-180': menuIsOpen,
                'stroke-red-800': error,
              })}
            />
          )
        : null,
  };
};

const STYLES: StylesConfig = {
  control: (provided) => {
    delete provided.boxShadow;
    delete provided.borderColor;
    delete provided.borderWidth;
    delete provided.borderStyle;
    return provided;
  },
  menuList: (provided) => {
    delete provided.paddingTop;
    delete provided.paddingBottom;

    return provided;
  },
  menu: (provided) => {
    delete provided.marginTop;
    delete provided.marginBottom;

    return provided;
  },
  option: (provided) => {
    delete provided.backgroundColor;

    return provided;
  },
};

const IS_OPTION_DISABLED = <T,>(option: SelectOption<T>) => !!option.disabled;

export type SelectRef<T, IsMulti extends boolean = false> = Ref<
  SelectClass<SelectOption<T>, IsMulti>
>;

const InnerSelect = <OptionValue, IsMulti extends boolean = false>(
  {
    instanceId,
    disabled = false,
    label,
    options = [],
    defaultValue = null,
    current = null,
    allowEmpty = false,
    loading = false,
    placeholder = null,
    onChange,
    onSearch,
    theme = 'default',
    error = false,
    showSearch = false,
    hideValueWhenMenuOpen = false,
    numeric = false,
    ...props
  }: SelectProps<OptionValue, IsMulti>,
  ref: SelectRef<OptionValue, IsMulti>,
) => {
  type Option = SelectOption<OptionValue>;
  type Group = GroupBase<Option>;

  const SEARCH_OPTIONS = useMemo<UseFuseOptions<Option | Group>>(
    () => ({
      includeScore: false,
      keys: ['label'],
      threshold: 0.4,
    }),
    [],
  );

  const { result: optionsResult, search: setSearchTerm } = useFuse(options, SEARCH_OPTIONS);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      onSearch?.(term);
    },
    [onSearch, setSearchTerm],
  );

  const handleChange = useCallback(
    (option) => {
      onChange?.(option);
    },
    [onChange],
  );

  const {
    floating,
    reference,
    x,
    y,
    strategy,
    refs: { reference: referenceElement },
  } = useFloating({
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset({ mainAxis: 4 }), flip(), shift()],
  });

  const Menu = useCallback(
    ({ className, ...rest }: MenuProps<Option, IsMulti, Group>) => {
      return (
        <div
          ref={floating}
          className="z-20"
          style={{
            position: strategy,
            top: y ?? '',
            left: x ?? '',
            minWidth:
              theme === 'inline-primary'
                ? '300px'
                : (referenceElement.current as HTMLElement)?.offsetWidth,
          }}
        >
          <components.Menu
            className={classNames(
              className,
              'static h-auto overflow-hidden border rounded-md shadow-md border-gray-50 min-w-[11rem]',
            )}
            {...rest}
          />
        </div>
      );
    },
    [floating, referenceElement, strategy, theme, x, y],
  );

  const Control = useCallback(
    ({ children, className, ...rest }: ControlProps<Option, IsMulti, Group>) => (
      <div ref={reference}>
        <components.Control
          className={classNames(className, 'bg-transparent px-4 gap-x-0.5', {
            'border border-l-0 border-r-0 border-t-0 border-b-2 border-b-primary shadow-none rounded-none min-w-[30px] p-0 min-h-0':
              theme === 'inline-primary',
            'w-full bg-white border rounded-md': theme === 'default',
            'px-1 bg-white border-0': theme === 'default-bordernone',
            // '': !error, // focus.isFocused,
            '!border-navy-400 !border-2': rest.isFocused && !error,
            '!border-2 !border-red-400': error,
          })}
          {...rest}
        >
          {hideValueWhenMenuOpen && !rest.menuIsOpen && label && (
            <div className="text-gray-600">{label}</div>
          )}
          {children}
        </components.Control>
        {theme === 'inline-primary' && (
          <div className="mt-0.5 border-t-primary border-t-4 border-x-4 border-x-transparent mx-auto w-0 h-0" />
        )}
      </div>
    ),
    [error, hideValueWhenMenuOpen, label, reference, theme],
  );

  const Input = useCallback(
    ({ children, onChange, ...rest }: InputProps<Option, IsMulti, Group>) => {
      return (
        <components.Input
          {...rest}
          onChange={(e) => {
            if (numeric && !/^[0-9]*$/.test(e.currentTarget.value)) return;
            onChange?.(e);
          }}
          inputClassName="ring-0 focus:ring-0 outline-none focus:outline-none truncate"
        >
          {children}
        </components.Input>
      );
    },
    [numeric],
  );

  const customComponents = useMemo(
    () => getComponents<OptionValue, IsMulti, Group>(theme, error),
    [theme, error],
  );

  const isOptionSelected = useCallback<SelectProps<OptionValue>['isOptionSelected']>(
    (option) => option.value === (current as Option)?.value,
    [current],
  );

  return (
    <div className={classNames({ 'w-fit': theme === 'inline-primary' })}>
      <ReactSelect<SelectOption<OptionValue>, IsMulti, Group>
        isOptionDisabled={IS_OPTION_DISABLED}
        isOptionSelected={isOptionSelected}
        instanceId={instanceId}
        defaultValue={defaultValue}
        onMenuOpen={() => setIsMenuOpen(true)}
        onMenuClose={() => setIsMenuOpen(false)}
        placeholder={placeholder}
        onInputChange={handleSearch}
        onChange={handleChange}
        options={optionsResult}
        value={hideValueWhenMenuOpen && isMenuOpen ? null : current}
        isDisabled={disabled}
        isLoading={loading}
        isClearable={allowEmpty}
        isSearchable={showSearch}
        noOptionsMessage={() => <div className="p-2">No results</div>}
        theme={DEFAULT_THEME}
        styles={STYLES}
        ref={ref}
        components={{
          Menu,
          Control,
          Input,
          ...customComponents,
        }}
        {...props}
      />
    </div>
  );
};

const Select = React.forwardRef(InnerSelect) as <T, IsMulti extends boolean = false>(
  props: SelectProps<T> & {
    ref?: SelectRef<T, IsMulti>;
  },
) => React.ReactElement;

export default Select;
