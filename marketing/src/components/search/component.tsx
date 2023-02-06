import { FC, useRef } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/solid';
import { useButton } from '@react-aria/button';
import { useSearchField } from '@react-aria/searchfield';
import { useSearchFieldState } from '@react-stately/searchfield';

import Input from 'components/forms/input';

import type { SearchProps } from './types';

export const Search: FC<SearchProps> = ({ ...props }: SearchProps) => {
  const { placeholder } = props;
  const state = useSearchFieldState(props);

  const ref = useRef();
  const { inputProps, clearButtonProps } = useSearchField(props, state, ref);
  const { buttonProps } = useButton(clearButtonProps, null);

  return (
    <div className="relative flex items-center w-full">
      <Input
        {...inputProps}
        icon={SearchIcon}
        ref={ref}
        placeholder={placeholder}
        type="search"
        className="h-full"
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
