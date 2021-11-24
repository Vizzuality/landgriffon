import { Fragment, useCallback, useState, useMemo } from 'react';
import classNames from 'classnames';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronUpIcon, ChevronRightIcon, XIcon } from '@heroicons/react/solid';
import Tree, { TreeNode, TreeProps } from 'rc-tree';
import Fuse from 'fuse.js';

import type { TreeSelectProps, TreeSelectOption } from './types';

const TREE_NODE_CLASSNAMES =
  'flex items-center space-x-2 p-1 whitespace-nowrap text-sm cursor-pointer hover:bg-green-50 hover:text-green-700';

const SEARCH_OPTIONS = {
  includeScore: false,
  keys: ['label', 'children.label'],
  threshold: 0.4,
};

const TreeSelect: React.FC<TreeSelectProps> = ({
  options = [],
  placeholder,
  showSearch = false,
  onChange,
  onSearch,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selected, setSelected] = useState<TreeSelectOption>(null);
  const [selectedKeys, setSelectedKeys] = useState<TreeProps['defaultSelectedKeys']>([]);
  const [expandedKeys, setExpandedKeys] = useState<TreeProps['defaultExpandedKeys']>([]);

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

  const customSwitcherIcon = useCallback(({ isLeaf, expanded }) => {
    if (isLeaf) return null;
    if (expanded) return <ChevronDownIcon className="h-4 w-4" />;
    return <ChevronRightIcon className="h-4 w-4" />;
  }, []);

  const handleToggleOpen = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  const handleExpand: TreeProps['onExpand'] = useCallback((keys) => setExpandedKeys(keys), []);

  const handleSelect: TreeProps['onSelect'] = useCallback(
    (keys, { node }) => {
      const currentSelection = { label: node.title as string, value: node.key };
      setSelectedKeys(keys);
      setSelected(currentSelection);
      if (onChange) onChange(currentSelection);
      setIsOpen(false);
    },
    [onChange],
  );

  // Search capability
  const fuse = useMemo(() => new Fuse(options, SEARCH_OPTIONS), [options]);
  const handleSearch = useCallback(
    (e) => {
      setSearchTerm(e.currentTarget.value);
      if (onSearch) onSearch(e.currentTarget.value);
    },
    [onSearch],
  );
  const resetSearch = useCallback(() => setSearchTerm(''), []);
  const optionsResult: TreeSelectProps['options'] = useMemo(() => {
    if (searchTerm && searchTerm !== '') {
      // TO-DO: investigate if there is a better way for nesting search and Fuse.js
      return fuse.search(searchTerm).map(({ item }) => {
        if (!item.children || item.children.length === 0) return item;
        const fuseChildren = new Fuse(item.children, SEARCH_OPTIONS);
        const childrenResult = fuseChildren.search(searchTerm);
        return {
          ...item,
          children: childrenResult.map(({ item: itemChildren }) => itemChildren),
        };
      });
    }
    return options;
  }, [fuse, options, searchTerm]);

  return (
    <div className="relative">
      <button
        type="button"
        className="bg-white relative w-full flex align-center border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default
        focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 text-sm cursor-pointer"
        onClick={handleToggleOpen}
      >
        <span className="inline-block truncate">{selected ? selected.label : placeholder}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {isOpen ? (
            <ChevronUpIcon className="h-4 w-4 text-gray-900" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-gray-900" aria-hidden="true" />
          )}
        </span>
      </button>
      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <div className="absolute z-20 max-w-min max-w-xl max-h-96 bg-white shadow-lg rounded-md mt-1 ring-1 ring-black ring-opacity-5 overflow-auto">
          {showSearch && (
            <div className="relative">
              <input
                type="search"
                value={searchTerm}
                placeholder="Search"
                className="min-w-full w-24 focus:ring-0 focus:border-green-700 block text-sm border-0 border-b border-gray-300 rounded-t-md pr-8"
                onChange={handleSearch}
              />
              <button
                type="button"
                onClick={resetSearch}
                className="absolute right-0 transform -translate-y-1/2 top-1/2 px-2 py-1"
              >
                <XIcon className="h-4 w-4 text-gray-300" />
              </button>
            </div>
          )}
          <div className="p-4">
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
              {renderTreeNodes(optionsResult)}
            </Tree>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default TreeSelect;
