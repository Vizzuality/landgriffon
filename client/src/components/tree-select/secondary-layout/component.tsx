import { useCallback, useState, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { TreeNode, TreeProps } from 'rc-tree';

import Badge from 'components/badge';

import type { TreeSelectProps, TreeSelectOption } from './types';

const TREE_NODE_CLASSNAMES =
  'flex items-center space-x-2 px-1 py-2 whitespace-nowrap text-sm cursor-pointer hover:bg-green-50 hover:text-green-700';

const TreeSelectSecondary: React.FC<TreeSelectProps> = ({
  current,
  currentOptions,
  isOpen,
  handleOpen,
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
                  'text-green-700 font-semibold': selectedKeys.includes(item.value),
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
                'text-green-700 font-semibold': selectedKeys.includes(item.value),
              })}
            />
          );
        }),
    [selectedKeys],
  );

  const handleToggleOpen = useCallback(() => handleOpen(!isOpen), [isOpen]);

  const Icon = () => (
    <span className="absolute -bottom-0.5 flex pointer-events-none transform left-1/2 -translate-x-1/2">
      {isOpen ? (
        <ChevronUpIcon className="h-4 w-4 text-green-700" aria-hidden="true" />
      ) : (
        <ChevronDownIcon className="h-4 w-4 text-green-700" aria-hidden="true" />
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
    <div className="align-left bg-white relative p-2 cursor-pointer" onClick={handleToggleOpen}>
      <div className="flex max-w-[150px] overflow-hidden truncate">
        {currentOptions &&
          !!currentOptions.length &&
          currentOptions.map((option) => (
            <Badge
              key={option.value}
              className="text-sm m-0.5"
              data={option}
              onClick={handleRemoveBadget}
              background={false}
            >
              {option.label}
            </Badge>
          ))}
        {(!currentOptions || currentOptions.length === 0) && (
          <span className="inline-block">
            {placeholder && (
              <span className="mb-2 border-b-2 border-green-700 text-sm ">{placeholder}</span>
            )}
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
          <span className="text-green-700">{placeholder}</span>
        )}
      </span>
      <Icon />
    </button>
  );
};

export default TreeSelectSecondary;
