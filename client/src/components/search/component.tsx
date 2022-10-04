import { useCallback } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/solid';

import Input from 'components/forms/input';
import classNames from 'classnames';

import type { ChangeEvent } from 'react';

type SearchProps = Omit<React.ComponentProps<typeof Input>, 'type' | 'icon' | 'onChange'> & {
  onChange: (value: string) => void;
};

export const Search: React.FC<SearchProps> = (props: SearchProps) => {
  const { onChange, className, value } = props;

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
    <div className={classNames('relative flex items-center', className)}>
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
