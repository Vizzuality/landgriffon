import { useCallback, useState, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { TreeNode, TreeProps } from 'rc-tree';

import Badge from 'components/badge';

import type { TreeSelectProps, TreeSelectOption } from './types';

const TREE_NODE_CLASSNAMES =
  'flex items-center space-x-2 px-1 py-2 whitespace-nowrap text-sm cursor-pointer hover:bg-green-50 hover:text-green-700';

const TreeSelectPrimary: React.FC<TreeSelectProps> = ({
  current,
  currentOptions,
  isOpen,
  handleOpen,
  maxBadges = 5,
  multiple = false,
  placeholder,
  handleRemoveBadget,
}) => {
  const [selected, setSelected] = useState<TreeSelectOption>(null);
  const [selectedKeys, setSelectedKeys] = useState<TreeProps['selectedKeys']>([]);
<<<<<<< HEAD
=======
  const [checkedKeys, setCheckedKeys] = useState<TreeProps['checkedKeys']>([]);
>>>>>>> 1239ad6 (analysis new intervention - multiple selects to step 1)

  const renderTreeNodes = useMemo(
    () =>
      (data, counter = 0) =>
        data.map((item) => {
          if (item.children) {
            return (
              <TreeNode
                key={item.value}
                title={item.label}
                className={classNames(TREE_NODE_CLASSNAMES, `pl-${4 * counter}`, {
                  'bg-green-50 text-green-700 font-semibold': selectedKeys.includes(item.value),
                })}
              >
                {renderTreeNodes(item.children, counter + 1)}
              </TreeNode>
            );
          }
          return (
            <TreeNode
              key={item.value}
              title={item.label}
              className={classNames(TREE_NODE_CLASSNAMES, `pl-${4 * counter}`, {
                'bg-green-50 text-green-700 font-semibold': selectedKeys.includes(item.value),
              })}
            />
          );
        }),
    [selectedKeys],
  );

  const handleToggleOpen = useCallback(() => handleOpen(!isOpen), [isOpen]);

  const Icon = () => (
    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
      {isOpen ? (
        <ChevronUpIcon className="h-4 w-4 text-gray-900" aria-hidden="true" />
      ) : (
        <ChevronDownIcon className="h-4 w-4 text-gray-900" aria-hidden="true" />
      )}
    </span>
  );

  // Current selection
  useEffect(() => {
    if (current && current.length) {
      const currentKeys = current.map(({ value }) => value);
      setSelected(current[0]);
      setSelectedKeys(currentKeys);
<<<<<<< HEAD
=======
      setCheckedKeys(currentKeys);
>>>>>>> 1239ad6 (analysis new intervention - multiple selects to step 1)
    }
  }, [current]);

  return multiple ? (
    <div
      className="flex align-center bg-white relative border border-gray-300 rounded-md shadow-sm py-2 pr-10 pl-3 cursor-pointer"
      onClick={handleToggleOpen}
    >
      <div className="flex flex-wrap">
        {currentOptions &&
          !!currentOptions.length &&
          currentOptions.slice(0, maxBadges).map((option) => (
            <Badge
              key={option.value}
              className="text-sm m-0.5"
              data={option}
              onClick={handleRemoveBadget}
              removable
            >
              {option.label}
            </Badge>
          ))}
        {currentOptions && currentOptions.length > maxBadges && (
          <Badge className="text-sm m-0.5">{currentOptions.length - maxBadges} more selected</Badge>
        )}
        {(!currentOptions || currentOptions.length === 0) && (
          <span className="inline-block truncate">
            {placeholder && <span className="text-gray-300 text-sm">{placeholder}</span>}
          </span>
        )}
      </div>
      <Icon />
    </div>
  ) : (
    <button
      type="button"
      className="bg-white relative w-full flex align-center border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left
      focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 text-sm cursor-pointer"
      onClick={handleToggleOpen}
    >
      <span className="inline-block truncate">
        {selected ? (
          <span className="font-medium">{selected.label}</span>
        ) : (
          <span className="text-gray-300">{placeholder}</span>
        )}
      </span>
      <Icon />
    </button>
  );
};

export default TreeSelectPrimary;
