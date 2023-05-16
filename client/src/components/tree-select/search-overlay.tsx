import classNames from 'classnames';
import { useCallback } from 'react';

import { getParents } from './utils';

import type { MatchResult } from 'utils/string';
import type { WithRequiredProperty } from 'types';
import type { FlattenNode, Key } from 'rc-tree/lib/interface';
import type { Dispatch } from 'react';
import type { TreeDataNode, TreeSelectOption } from './types';

interface SearchOverlayProps {
  options: (WithRequiredProperty<Partial<FlattenNode<TreeDataNode>>, 'key' | 'title'> & {
    isSelected: boolean;
    matchingParts: MatchResult[];
    disabled?: boolean;
  })[];
  onChange: Dispatch<Key>;
}

const SearchOverlay = ({ options, onChange }: SearchOverlayProps) => {
  const getHandleChange = useCallback(
    (value: TreeSelectOption['value'], disabled?: boolean) => () => {
      if (disabled) return;
      onChange(value);
    },
    [onChange],
  );

  return (
    <div data-testid="tree-select-search-results">
      {options.map(({ matchingParts, data: { label }, key, isSelected, parent, disabled }) => {
        const parents = getParents({ parent } as FlattenNode<TreeDataNode>);
        return (
          <button
            title={label}
            type="button"
            className={classNames('text-sm p-2 w-full text-left', {
              'font-bold cursor-pointer text-navy-400 hover:bg-navy-50': isSelected,
              'text-gray-300 hover:bg-white cursor-default pointer-events-none': disabled,
              'text-gray-900 cursor-pointer hover:bg-navy-50': !isSelected && !disabled,
            })}
            key={key}
            onClick={getHandleChange(key as string, disabled)}
          >
            {matchingParts.map(({ value, isMatch }, i) => {
              return (
                <span className={classNames({ 'font-bold': isMatch })} key={`${value}-${i}`}>
                  {value}
                </span>
              );
            })}
            {parents.length !== 0 && (
              <>
                {' '}
                <span className="italic text-gray-400">
                  ({parents.map((parent) => parent.data.label).join(', ')})
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SearchOverlay;
