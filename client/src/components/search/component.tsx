import { FC, useCallback, useState } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/solid';

import Input from 'components/forms/input';

import type { SearchProps } from './types';

export const Search: FC<SearchProps> = (props: SearchProps) => {
  const { onChange } = props;
  const [value, setValue] = useState<SearchProps['value']>(null);

  const handleChange = useCallback(
    (e) => {
      if (onChange) onChange(e.target.value);
      setValue(e.target.value);
    },
    [onChange],
  );

  const handleReset = useCallback(() => {
    if (onChange) onChange('');
    setValue('');
  }, [onChange]);

  return (
    <div className="relative flex items-center w-full">
      <Input
        {...props}
        value={value}
        icon={SearchIcon}
        type="search"
        className="h-full"
        onChange={handleChange}
      />

      {value && value !== '' && (
        <button
          className="absolute z-10 flex items-center self-center justify-center w-5 h-5 right-3 r-2"
          type="button"
          onClick={handleReset}
        >
          <XIcon className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default Search;
