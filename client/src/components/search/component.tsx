import { useCallback, useState } from 'react';
import { SearchIcon, XIcon } from '@heroicons/react/solid';
import classNames from 'classnames';

import Input from 'components/forms/input';

import type { ChangeEvent } from 'react';
import type { SearchProps } from './types';

export const Search: React.FC<SearchProps> = (props: SearchProps) => {
  const [value, setValue] = useState<string>((props.defaultValue as string) || '');
  const { onChange } = props;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      setValue(e.target.value);
      if (onChange) onChange(e.target.value);
    },
    [onChange],
  );

  const handleReset = useCallback(() => {
    setValue('');
  }, []);

  return (
    <div className={classNames('relative', props.className)}>
      <Input
        icon={<SearchIcon />}
        {...props}
        unit="&nbsp;"
        type="search"
        className="w-full"
        value={value}
        onChange={handleChange}
      />
      {value && value !== '' && (
        <button
          className="absolute inset-y-0 right-0 flex items-center pr-3"
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
