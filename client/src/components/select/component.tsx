import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import type {
  Theme,
  StylesConfig,
  MenuProps,
  ControlProps,
  OptionProps,
  InputProps,
} from 'react-select';
import ReactSelect, { defaultTheme, components } from 'react-select';
import { ChevronDownIcon } from '@heroicons/react/outline';
import tw from 'twin.macro';

import useFuse from 'hooks/fuse';

import Loading from 'components/loading';

import type { SelectOption, SelectProps } from './types';
import { flip, offset, shift, useFloating, autoUpdate } from '@floating-ui/react-dom';

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

const customStyles: (theme: SelectProps['theme'], error?: boolean) => StylesConfig = (
  theme,
  error = false,
) => {
  return {
    container: (provided) => ({
      ...provided,
      ...tw`text-sm`,
      ...(theme === 'default' && tw`shadow-sm`),
    }),
    option: (provided, { isDisabled, isSelected }) => ({
      ...provided,
      ...tw`text-gray-900 truncate cursor-pointer hover:bg-green-50`,
      ...(isDisabled && tw`bg-primary`),
      ...(isSelected && tw`text-white hover:bg-primary`),
    }),
    control: (provided, { isFocused }) => ({
      ...provided,
      boxShadow: 'none',
      backgroundColor: 'transparent',
      ...(theme === 'inline-primary' &&
        tw`border border-l-0 border-r-0 border-t-0 border-b-2 border-b-primary shadow-none rounded-none min-w-[30px] p-0 min-h-0`),
      ...(theme === 'default' && tw`w-full bg-white border rounded-md`),
      ...tw`px-4 gap-x-0.5`,
      ...(theme === 'default-bordernone' && tw`px-1 bg-white border-0`),
      ...(isFocused && tw`ring-1 ring-primary`),
      ...(error && tw`border-2 border-red-600`),
    }),
    singleValue: (provided) => ({
      ...provided,
      ...tw`my-auto`,
      ...(theme === 'inline-primary' && tw`font-bold text-primary`),
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      ...(theme === 'inline-primary' ? tw`hidden` : tw`ml-2 mr-1 w-min`),
    }),
    indicatorSeparator: () => tw`hidden`,
    menu: (provided) => ({
      ...provided,
      ...tw`static h-auto my-0 overflow-hidden border rounded-md shadow-md border-gray-50 min-w-[11rem]`,
    }),
    menuList: (provided) => ({ ...provided, ...tw`py-0` }),
    valueContainer: (provided) => ({ ...provided, ...tw`px-0` }),
  };
};

const SEARCH_OPTIONS = {
  includeScore: false,
  keys: ['label'],
  threshold: 0.4,
};

const Select: React.FC<SelectProps> = React.forwardRef<HTMLInputElement, SelectProps>(
  (
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
    },
    ref,
  ) => {
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

    const Menu: React.FC<MenuProps> = useCallback(
      ({ children, ...rest }) => (
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
          <components.Menu {...rest}>{children}</components.Menu>
        </div>
      ),
      [floating, referenceElement, strategy, theme, x, y],
    );

    const Control: React.FC<ControlProps> = useCallback(
      ({ children, ...rest }) => (
        <div ref={reference}>
          <components.Control {...rest}>
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
      [hideValueWhenMenuOpen, label, reference, theme],
    );

    const Input: React.FC<InputProps> = useCallback(
      ({ children, onChange, ...rest }) => {
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

    const Option: React.FC<OptionProps<SelectOption>> = useCallback(
      ({ innerProps, innerRef, isSelected, isFocused, isDisabled, data: { label, extraInfo } }) => (
        <div {...innerProps} ref={innerRef}>
          <div
            className={classNames(
              isFocused ? ' bg-green-50 text-primary' : 'text-gray-900',
              isSelected && 'bg-green-50 text-primary',
              'cursor-pointer select-none relative py-2 px-4',
              isDisabled && 'text-opacity-50 cursor-default',
            )}
          >
            <div className="flex flex-row gap-x-2">
              <div
                className={classNames(
                  isSelected ? 'font-semibold' : 'font-normal',
                  'block truncate',
                )}
              >
                {label}
              </div>
              {extraInfo && (
                <div>
                  <span className="text-xs italic text-gray-600">{extraInfo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      [],
    );

    const styles = useMemo(() => customStyles(theme, error), [error, theme]);

    return (
      <div className={classNames({ 'w-fit': theme === 'inline-primary' })}>
        <input ref={ref} className="hidden" />
        <ReactSelect
          instanceId={instanceId}
          defaultValue={defaultValue}
          onMenuOpen={() => setIsMenuOpen(true)}
          onMenuClose={() => setIsMenuOpen(false)}
          styles={styles}
          placeholder={placeholder}
          onInputChange={handleSearch}
          onChange={handleChange}
          options={optionsResult.map(({ disabled, ...option }) => ({
            ...option,
            isDisabled: disabled,
          }))}
          value={hideValueWhenMenuOpen && isMenuOpen ? null : current}
          isDisabled={disabled}
          isLoading={loading}
          isClearable={allowEmpty}
          isSearchable={showSearch}
          noOptionsMessage={() => <div className="p-2">No results</div>}
          theme={
            error
              ? { ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, primary25: 'red' } }
              : DEFAULT_THEME
          }
          components={{
            Option,
            IndicatorSeparator: null,
            LoadingIndicator: () => <Loading className="text-primary" />,
            DropdownIndicator:
              theme === 'default' || theme === 'default-bordernone'
                ? ({ selectProps: { menuIsOpen } }) => (
                    <ChevronDownIcon
                      className={classNames('h-4 w-4 text-gray-900', {
                        'rotate-180': menuIsOpen,
                        'stroke-red-700': error,
                      })}
                    />
                  )
                : null,
            Menu,
            Control,
            Input,
          }}
        />
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
