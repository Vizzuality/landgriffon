import { useCallback, useEffect, useState } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/solid';
import classnames from 'classnames';
import { omit } from 'lodash-es';
import { useDebounce } from 'rooks';
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

  const handleSearchByTerm = useDebounce((value, queryName) => {
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
      <div className="flex w-full items-center justify-center">
        <SearchIcon className="h-6 w-6 text-gray-300" />
        <input
          {...omit(props, ['defaultValue', 'onChange'])}
          className={classnames(
            'flex-1 truncate border-none p-4 pb-3 pt-2.5 text-base leading-5 placeholder:text-gray-400 focus:outline-none focus:ring-0',
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
            <XIcon className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;
