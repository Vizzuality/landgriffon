import { FC, useRef } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/solid';
import { useButton } from '@react-aria/button';
import { useSearchField } from '@react-aria/searchfield';
import { useSearchFieldState } from '@react-stately/searchfield';

import type { SearchProps } from './types';

export const Search: FC<SearchProps> = ({ ...props }: SearchProps) => {
  const { placeholder } = props;
  const state = useSearchFieldState(props);

  const ref = useRef();
  const { inputProps, clearButtonProps } = useSearchField(props, state, ref);
  const { buttonProps } = useButton(clearButtonProps, null);

  return (
    <div className="relative flex items-center w-full">
      <SearchIcon className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3" />

      <input
        {...inputProps}
        ref={ref}
        placeholder={placeholder}
        type="search"
        className="h-full py-2 pl-10 pr-8 text-sm font-medium leading-4 text-left bg-white border border-gray-300 rounded-md shadow-sm md:w-auto focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700"
      />

      {state.value !== '' && (
        <button
          {...buttonProps}
          tabIndex="clear"
          className="absolute z-10 flex items-center self-center justify-center w-5 h-5 right-3 r-2"
          type="button"
        >
          <XIcon className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default Search;
