import { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import ReactSelect, {
  Theme,
  defaultTheme,
  StylesConfig,
  components,
  MenuProps,
  MenuListProps,
  ControlProps,
} from 'react-select';
import { ChevronDownIcon } from '@heroicons/react/outline';
import tw from 'twin.macro';

import useFuse from 'hooks/fuse';

import Loading from 'components/loading';

import type { SelectProps } from './types';
import { offset, useFloating } from '@floating-ui/react-dom';
import { useMergeRefs } from 'rooks';

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

const customStyles: StylesConfig = {
  option: (provided, { isDisabled, isSelected }) => ({
    ...provided,
    ...tw`text-gray-900 text-sm cursor-pointer hover:bg-green-50`,
    ...(isDisabled && tw`bg-green-700`),
    ...(isSelected && tw`text-white hover:bg-green-700`),
  }),
  control: (provided) => ({
    ...provided,
    ...tw`w-full rounded-md`,
    boxShadow: 'none',
  }),
  indicatorSeparator: () => tw`hidden`,
  menu: (provided) => ({
    ...provided,
    ...tw`overflow-hidden h-auto border border-gray-700 rounded-md my-0`,
  }),
};

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
      console.log({ option });

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
    // TODO: placement style dependent, also look into adding autoplacement so it goes up if there's no space
    placement: 'bottom',
    middleware: [offset({ mainAxis: 2 })],
  });

  const Menu: React.FC<MenuProps> = useCallback(
    ({ children, ...rest }) => (
      <div
        ref={floating}
        style={{
          position: strategy,
          top: y ?? '',
          left: x ?? '',
          width: (referenceElement.current as HTMLElement)?.offsetWidth,
        }}
      >
        <components.Menu {...rest}>{children}</components.Menu>
      </div>
    ),
    [floating, referenceElement, strategy, x, y],
  );

  const Control: React.FC<ControlProps> = useCallback(
    ({ children, ...rest }) => (
      <components.Control {...rest} innerRef={reference}>
        {children}
      </components.Control>
    ),
    [reference],
  );

  return (
    <ReactSelect
      styles={customStyles}
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
      theme={DEFAULT_THEME}
      components={{
        // Option: ({
        //   innerProps,
        //   innerRef,
        //   isSelected,
        //   isFocused,
        //   isDisabled,
        //   data: { label, extraInfo },
        // }) => (
        //   <div {...innerProps} ref={innerRef}>
        //     <div
        //       className={classNames(
        //         isFocused ? 'bg-green-50 text-green-700' : 'text-gray-900',
        //         isSelected && 'bg-green-50 text-green-700',
        //         'cursor-pointer select-none relative py-2 pl-4 pr-4',
        //         isDisabled && 'text-opacity-50 cursor-default',
        //       )}
        //     >
        //       <div className="flex flex-row gap-x-2">
        //         <div
        //           className={classNames(
        //             isSelected ? 'font-semibold' : 'font-normal',
        //             'block text-sm truncate',
        //           )}
        //         >
        //           {label}
        //         </div>
        //         {extraInfo && (
        //           <div>
        //             <i className="text-gray-600 text-sm">{extraInfo}</i>
        //           </div>
        //         )}
        //       </div>
        //     </div>
        //   </div>
        // ),
        IndicatorSeparator: null,
        LoadingIndicator: () => <Loading className="text-green-700" />,
        DropdownIndicator: ({ selectProps: { menuIsOpen } }) => (
          <ChevronDownIcon
            className={classNames('h-4 w-4 mx-4 text-gray-900', { 'rotate-180': menuIsOpen })}
          />
        ),
        // MenuList,
        Menu,
        Control,
      }}
    />
  );
};

export default Select;
