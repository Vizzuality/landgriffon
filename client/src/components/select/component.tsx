import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import classNames from 'classnames';
import ReactSelect, {
  Theme,
  defaultTheme,
  StylesConfig,
  components,
  MenuProps,
  ControlProps,
  OptionProps,
  InputProps,
  ValueContainerProps,
} from 'react-select';
import { ChevronDownIcon } from '@heroicons/react/outline';
import tw from 'twin.macro';

import useFuse from 'hooks/fuse';

import Loading from 'components/loading';

import type { SelectProps } from './types';
import { flip, offset, shift, useFloating } from '@floating-ui/react-dom';

/**
 * Overriding default React Select theme
 * https://react-select.com/styles#overriding-the-theme
 */
const DEFAULT_THEME: Theme = {
  ...defaultTheme,
  borderRadius: 6,
  colors: {
    ...defaultTheme.colors,
    primary: '#00634A',
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
    option: (provided, { isDisabled, isSelected }) => ({
      ...provided,
      ...tw`text-gray-900 text-sm cursor-pointer hover:bg-green-50 truncate`,
      ...(isDisabled && tw`bg-green-700`),
      ...(isSelected && tw`text-white hover:bg-green-700`),
    }),
    control: (provided) => ({
      ...provided,
      boxShadow: 'none',
      ...(error && tw`border-red-600 border-2`),
      ...(theme === 'inline-primary' &&
        tw`border border-l-0 border-r-0 border-t-0 border-b-2 border-b-green-700 shadow-none rounded-none min-w-[30px] p-0 min-h-0`),
      ...(theme === 'default-bordernone' && tw``),
      ...(theme === 'default' && tw`w-full rounded-md`),
    }),
    valueContainer: (provided) => ({
      ...provided,
      ...(theme === 'inline-primary' && tw`p-0`),
    }),
    singleValue: (provided) => ({
      ...provided,
      ...tw`my-auto`,
      ...(theme === 'inline-primary' && tw`text-green-700 font-bold`),
    }),
    indicatorSeparator: () => tw`hidden`,
    menu: (provided) => ({
      ...provided,
      ...tw`overflow-hidden h-auto shadow-md rounded-md my-0 border border-gray-50`,
    }),
    menuList: (provided) => ({ ...provided, ...tw`py-0` }),
  };
};

const SEARCH_OPTIONS = {
  includeScore: false,
  keys: ['label'],
  threshold: 0.4,
};

const Input: React.FC<InputProps> = ({ children, ...rest }) => {
  return (
    <components.Input
      {...rest}
      inputClassName="ring-0 focus:ring-0 outline-none focus:outline-none focus:outline-0 truncate"
    >
      {children}
    </components.Input>
  );
};

const Select: React.FC<SelectProps> = ({
  disabled = false,
  label,
  options = [],
  current = null,
  allowEmpty = false,
  loading = false,
  placeholder = null,
  onChange,
  onSearch,
  theme = 'default',
  error = false,
  showSearch = false,
}) => {
  const { result: optionsResult, search: setSearchTerm } = useFuse(options, SEARCH_OPTIONS);

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
    update,
  } = useFloating({
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset({ mainAxis: 4 }), flip(), shift()],
  });

  useLayoutEffect(() => {
    update();
  }, [theme, update]);

  const Menu: React.FC<MenuProps> = useCallback(
    ({ children, ...rest }) => (
      <div
        ref={floating}
        className="z-20"
        style={{
          position: strategy,
          top: y ?? '',
          left: x ?? '',
          width:
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
        <components.Control {...rest}>{children}</components.Control>
        {theme === 'inline-primary' && (
          <div className="mt-0.5 border-t-green-700 border-t-4 border-x-4 border-x-transparent mx-auto w-0 h-0" />
        )}
      </div>
    ),
    [reference, theme],
  );

  const ValueContainer: React.FC<ValueContainerProps> = useCallback(
    ({ children, ...rest }) => (
      <components.ValueContainer {...rest}>
        <div className="flex flex-row justify-start gap-x-0.5">
          {label && <span className="text-sm text-gray-600 h-min my-auto">{label}</span>}
          {children}
        </div>
      </components.ValueContainer>
    ),
    [label],
  );

  const Option: React.FC<OptionProps<{ extraInfo?: React.ReactNode; label: string }>> = useCallback(
    ({ innerProps, innerRef, isSelected, isFocused, isDisabled, data: { label, extraInfo } }) => (
      <div {...innerProps} ref={innerRef}>
        <div
          className={classNames(
            isFocused ? 'bg-green-50 text-green-700' : 'text-gray-900',
            isSelected && 'bg-green-50 text-green-700',
            'cursor-pointer select-none relative py-2 pl-4 pr-4',
            isDisabled && 'text-opacity-50 cursor-default',
          )}
        >
          <div className="flex flex-row gap-x-2">
            <div
              className={classNames(
                isSelected ? 'font-semibold' : 'font-normal',
                'block text-sm truncate',
              )}
            >
              {label}
            </div>
            {extraInfo && (
              <div>
                <i className="text-gray-600 text-sm">{extraInfo}</i>
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
      <ReactSelect
        className=""
        styles={styles}
        placeholder={placeholder}
        onInputChange={handleSearch}
        onChange={handleChange}
        options={optionsResult.map(({ disabled, ...option }) => ({
          ...option,
          isDisabled: disabled,
        }))}
        value={current}
        isDisabled={disabled}
        isLoading={loading}
        isClearable={allowEmpty}
        isSearchable={showSearch}
        noOptionsMessage={() => <div className="p-2 text-sm">No results</div>}
        theme={
          error
            ? { ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, primary25: 'red' } }
            : DEFAULT_THEME
        }
        components={{
          Option,
          IndicatorSeparator: null,
          LoadingIndicator: () => <Loading className="text-green-700" />,
          DropdownIndicator:
            theme === 'default'
              ? ({ selectProps: { menuIsOpen } }) => (
                  <ChevronDownIcon
                    className={classNames('h-4 w-4 mx-4 text-gray-900', {
                      'rotate-180': menuIsOpen,
                    })}
                  />
                )
              : null,
          Menu,
          Control,
          Input,
          ValueContainer,
        }}
      />
    </div>
  );
};

export default Select;
