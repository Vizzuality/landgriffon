import type { ChangeEvent } from 'react';
import { useCallback } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/solid';

import Input from 'components/forms/input';

type SearchProps = Omit<React.ComponentProps<typeof Input>, 'type' | 'icon'> & {
  onChange: (value: string) => void;
  value: string;
};

export const Search = (props: SearchProps) => {
  const { onChange, value } = props;
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    },
    [onChange],
  );

  const handleReset = useCallback(() => {
    onChange?.('');
  }, [onChange]);

  return (
    <div className="relative flex items-center w-full">
      <Input
        {...props}
        icon={SearchIcon}
        type="search"
        className="w-full h-full"
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
