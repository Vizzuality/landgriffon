import classNames from 'classnames';
import { useCallback } from 'react';

import type { Dispatch } from 'react';
import type { TreeSelectOption } from './types';

interface SearchOverlayProps {
  options: (Omit<TreeSelectOption, 'children'> & { isSelected: boolean })[];
  onChange: Dispatch<TreeSelectOption['value']>;
}

const SearchOverlay = ({ options, onChange }: SearchOverlayProps) => {
  const getHandleChange = useCallback(
    (value: TreeSelectOption['value']) => () => {
      onChange(value);
    },
    [onChange],
  );

  return (
    <div>
      {options.map(({ label, value, isSelected }) => (
        <button
          type="button"
          className={classNames(
            'p-2 hover:bg-navy-50 cursor-pointer block w-full text-left',
            isSelected ? 'font-bold text-navy-400' : 'text-gray-900',
          )}
          key={value}
          onClick={getHandleChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default SearchOverlay;
