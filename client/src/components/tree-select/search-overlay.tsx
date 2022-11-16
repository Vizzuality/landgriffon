import classNames from 'classnames';
import { useCallback } from 'react';

import type { WithRequiredProperty } from 'types';
import type { FlattenNode, Key } from 'rc-tree/lib/interface';
import type { Dispatch } from 'react';
import type { TreeDataNode, TreeSelectOption } from './types';

interface SearchOverlayProps {
  options: (WithRequiredProperty<Partial<FlattenNode<TreeDataNode>>, 'key' | 'title'> & {
    isSelected: boolean;
  })[];
  onChange: Dispatch<Key>;
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
      {options.map(({ title, key, isSelected }) => (
        <button
          type="button"
          className={classNames(
            'p-2 hover:bg-navy-50 cursor-pointer block w-full text-left',
            isSelected ? 'font-bold text-navy-400' : 'text-gray-900',
          )}
          key={key}
          onClick={getHandleChange(key)}
        >
          {title}
        </button>
      ))}
    </div>
  );
};

export default SearchOverlay;
