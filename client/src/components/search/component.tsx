import { useCallback, useEffect, useState } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/solid';
import classnames from 'classnames';
import { omit } from 'lodash-es';
import { useDebounceCallback } from '@react-hook/debounce';
import { useRouter } from 'next/router';

import type { ChangeEvent } from 'react';
import type { SearchProps } from './types';

export const Search: React.FC<SearchProps> = ({
  searchQuery = 'search',
  onChange,
  defaultValue,
  size = 'base',
  ...props
}: SearchProps) => {
  const { pathname, query, replace } = useRouter();

  const deafultSearchQuery = query[searchQuery];

  const initialValue =
    defaultValue || (typeof deafultSearchQuery === 'string' ? deafultSearchQuery : '');

  const [value, setValue] = useState<string>(initialValue);

  const handleSearchByTerm = useDebounceCallback((value, queryName) => {
    replace(
      {
        pathname,
        query: {
          ...omit(query, queryName),
          ...(value !== '' && { [queryName]: value }),
        },
      },
      null,
      { shallow: true },
    );
  }, 250);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      if (searchQuery) {
        handleSearchByTerm(e.target.value, searchQuery);
      }
      if (onChange) onChange(e.target.value);
    },
    [handleSearchByTerm, onChange, searchQuery],
  );

  const handleReset = useCallback(() => {
    setValue('');
    handleSearchByTerm('', searchQuery);
    if (onChange) onChange('');
  }, [handleSearchByTerm, onChange, searchQuery]);

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
    }
  }, [initialValue]);

  return (
    <div
      className={classnames('bg-white', {
        'w-fit min-w-[260px]': size === 'base',
        'flex w-auto max-w-[160px]': size === 'sm',
      })}
    >
      <div className="flex items-center justify-center w-full">
        <SearchIcon className="w-6 h-6 text-gray-300" />
        <input
          {...omit(props, ['defaultValue', 'onChange'])}
          className={classnames(
            'flex-1 p-4 pt-2.5 pb-3 leading-5 text-base placeholder:text-gray-400 focus:outline-none focus:ring-0 border-none truncate',
            props.disabled ? 'text-gray-300' : 'bg-white text-gray-900',
          )}
          type="search"
          value={value}
          onChange={handleChange}
        />
        {value && value !== '' && (
          <button
            className="inset-y-0 right-0 flex items-center pr-3"
            type="button"
            onClick={handleReset}
          >
            <XIcon className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;
