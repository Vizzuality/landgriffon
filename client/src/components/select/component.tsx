import { useCallback } from 'react';
import classNames from 'classnames';
import ReactSelect from 'react-select';

import Loading from 'components/loading';

import type { SelectProps } from './types';
import useFuse from 'hooks/fuse';

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
      onChange?.(option);
    },
    [onChange],
  );

  return (
    <ReactSelect
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
      components={{
        Option: ({
          innerProps,
          innerRef,
          isSelected,
          isFocused,
          isDisabled,
          data: { label, extraInfo },
        }) => (
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
        LoadingIndicator: () => <Loading />,
      }}
    />
  );
};

export default Select;
