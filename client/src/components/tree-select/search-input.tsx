import { XIcon } from '@heroicons/react/outline';
import classNames from 'classnames';

import type { InputHTMLAttributes } from 'react';
import type { CommonTreeProps } from './types';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  theme: CommonTreeProps['theme'];
  resetSearch: () => void;
}

const SearchInput = ({
  autoFocus,
  value,
  placeholder,
  disabled,
  theme,
  resetSearch,
  ...inputProps
}: SearchInputProps) => {
  return (
    <>
      <input
        autoFocus={autoFocus}
        type="search"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        className={classNames(
          'w-full p-0 py-2 pl-2 truncate bg-transparent border-none appearance-none focus:ring-0 h-[32px]',
          {
            // 'pl-2': multiple,
            'text-sm': theme !== 'inline-primary',
            'placeholder:text-gray-300': disabled,
            'placeholder:text-gray-500': !disabled,
          },
        )}
        autoComplete="off"
        {...inputProps}
      />
      {value && (
        <button type="button" onClick={resetSearch} className="flex-shrink-0">
          <XIcon className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </>
  );
};

export default SearchInput;
