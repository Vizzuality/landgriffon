import { Fragment, useCallback, useState, useMemo } from 'react';
import classNames from 'classnames';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon, ChevronRightIcon } from '@heroicons/react/solid';
import Tree, { TreeNode, TreeProps } from 'rc-tree';

import type { TreeSelectProps } from './types';

const TREE_NODE_CLASSNAMES = 'flex items-center space-x-2 my-1 whitespace-nowrap text-sm';

const TreeSelect: React.FC<TreeSelectProps> = ({ data = [] }) => {
  const [selectedKeys, setSelectedKeys] = useState<TreeProps['defaultSelectedKeys']>();
  const [expandedKeys, setExpandedKeys] = useState<TreeProps['defaultExpandedKeys']>();

  const renderTreeNodes = useMemo(
    () =>
      (data, counter = 0) =>
        data.map((item) => {
          // if (this.filterKeys && this.filterFn(item.key)) {
          //   this.filterKeys.push(item.key);
          // }
          if (item.children) {
            return (
              <TreeNode
                key={item.key}
                title={item.title}
                className={classNames(TREE_NODE_CLASSNAMES, `pl-${4 * counter}`)}
              >
                {renderTreeNodes(item.children, counter + 1)}
              </TreeNode>
            );
          }
          return (
            <TreeNode
              key={item.key}
              title={item.title}
              className={classNames(TREE_NODE_CLASSNAMES, `pl-${4 * counter}`)}
            />
          );
        }),
    [],
  );

  const customSwitcherIcon = useCallback(({ isLeaf, expanded }) => {
    if (isLeaf) return null;
    if (expanded) return <ChevronDownIcon className="h-4 w-4" />;
    return <ChevronRightIcon className="h-4 w-4" />;
  }, []);

  const handleExpand: TreeProps['onExpand'] = useCallback((keys) => setExpandedKeys(keys), []);

  const handleSelect: TreeProps['onSelect'] = useCallback((keys, info) => {
    console.log(info);
    setSelectedKeys(keys);
  }, []);

  console.log(selectedKeys);

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className="bg-white relative w-full flex align-center border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default
            focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 text-sm cursor-pointer"
          >
            <span className="inline-block truncate">Materials</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              {open ? (
                <ChevronUpIcon className="h-4 w-4 text-gray-900" aria-hidden="true" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-gray-900" aria-hidden="true" />
              )}
            </span>
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-20 min-w-min w-full max-h-96 bg-white shadow-lg rounded-md p-4 mt-1 ring-1 ring-black ring-opacity-5 overflow-auto">
              <Tree
                autoExpandParent
                checkable={false}
                selectable
                defaultSelectedKeys={selectedKeys}
                defaultExpandedKeys={expandedKeys}
                switcherIcon={customSwitcherIcon}
                onExpand={handleExpand}
                onSelect={handleSelect}
              >
                {renderTreeNodes(data)}
              </Tree>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default TreeSelect;
