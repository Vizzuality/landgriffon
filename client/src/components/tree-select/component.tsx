import { Fragment, useCallback, useState, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import { Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  XIcon,
  SearchIcon,
} from '@heroicons/react/solid';
import Tree, { TreeNode, TreeProps } from 'rc-tree';
import Fuse from 'fuse.js';

import Badge from 'components/badge';
import Loading from 'components/loading';

import type { TreeSelectProps, TreeSelectOption } from './types';

const TREE_NODE_CLASSNAMES =
  'flex items-center space-x-2 px-1 py-2 whitespace-nowrap text-sm cursor-pointer hover:bg-green-50 hover:text-green-700';

const SEARCH_OPTIONS = {
  includeScore: false,
  keys: ['label', 'children.label'],
  threshold: 0.4,
};

const TreeSelect: React.FC<TreeSelectProps> = ({
  current,
  loading,
  maxBadges = 5,
  multiple = false,
  options = [],
  placeholder,
  searchPlaceholder = 'Search',
  showSearch = false,
  onChange,
  onSearch,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selected, setSelected] = useState<TreeSelectOption>(null);
  const [selectedKeys, setSelectedKeys] = useState<TreeProps['selectedKeys']>([]);
  const [expandedKeys, setExpandedKeys] = useState<TreeProps['expandedKeys']>([]);
  const [checkedKeys, setCheckedKeys] = useState<TreeProps['checkedKeys']>([]);

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

  // Selection for non-multiple
  const handleSelect: TreeProps['onSelect'] = useCallback(
    (keys, { node }) => {
      const currentSelection = { label: node.title as string, value: node.key };
      setSelectedKeys(keys);
      setSelected(currentSelection);
      if (onChange) onChange(currentSelection);
      if (!multiple) setIsOpen(false);
    },
    [multiple, onChange],
  );

  // Selection for multiple
  const handleCheck = useCallback(
    (checkedKeys, info) => {
      const { checkedNodes } = info;
      // 1. Extracting parents selected
      const parentsWithChildren = checkedNodes.filter((node) => !!node?.children);
      // 2. Extracting children ids from parents selected above
      const childrenWithParents = [];
      if (parentsWithChildren && parentsWithChildren.length) {
        parentsWithChildren.forEach(({ children }) =>
          children.forEach(({ key }) => childrenWithParents.push(key)),
        );
      }
      // 3. Filtering checkedKeys with children ids to not send unnecessary values
      const filteredValues =
        childrenWithParents && childrenWithParents.length
          ? checkedKeys.filter((key) => !childrenWithParents.includes(key))
          : checkedKeys;

      // TO-DO: this function is repeated
      const checkedOptions = [];
      if (filteredValues) {
        (filteredValues as string[]).forEach((key) => {
          const recursiveSearch = (arr) => {
            arr.forEach((opt) => {
              if (opt.value === key) checkedOptions.push(opt);
              if (opt.children) recursiveSearch(opt.children);
            });
          };
          recursiveSearch(options);
        });
      }

      if (onChange) onChange(checkedOptions);
      setCheckedKeys(filteredValues);
    },
    [onChange, options],
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

  // Only for multiple, find options depending on checked keys
  const currentOptions = useMemo<TreeSelectOption[]>(() => {
    const checkedOptions = [];
    if (checkedKeys) {
      (checkedKeys as string[]).forEach((key) => {
        const recursiveSearch = (arr) => {
          arr.forEach((opt) => {
            if (opt.value === key) checkedOptions.push(opt);
            if (opt.children) recursiveSearch(opt.children);
          });
        };
        recursiveSearch(options);
      });
    }
    return checkedOptions;
  }, [checkedKeys, options]);

  const handleRemoveBadget = useCallback(
    (option) => {
      const filteredKeys = (checkedKeys as string[]).filter((key) => option.value !== key);
      // TO-DO: this function is repeated
      const checkedOptions = [];
      if (filteredKeys) {
        (filteredKeys as string[]).forEach((key) => {
          const recursiveSearch = (arr) => {
            arr.forEach((opt) => {
              if (opt.value === key) checkedOptions.push(opt);
              if (opt.children) recursiveSearch(opt.children);
            });
          };
          recursiveSearch(options);
        });
      }

      if (onChange) onChange(checkedOptions);
      setCheckedKeys(filteredKeys);
    },
    [checkedKeys, onChange, options],
  );

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
      setCheckedKeys(currentKeys);
    }
  }, [current]);

  return (
    <div className="relative">
      {multiple ? (
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
              <Badge className="text-sm m-0.5">
                {currentOptions.length - maxBadges} more selected
              </Badge>
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
      )}
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
        <div className="absolute z-20 min-w-full max-w-xl max-h-96 bg-white shadow-lg rounded-md mt-1 ring-1 ring-black ring-opacity-5 overflow-y-auto overflow-x-hidden">
          {loading && (
            <div className="p-4">
              <Loading className="text-green-700" />
            </div>
          )}
          {!loading && showSearch && (
            <div className="flex items-center border-b border-b-gray-400">
              <div className="pl-2 py-1">
                <SearchIcon className="block h-4 w-4 text-gray-400" />
              </div>
              <input
                type="search"
                value={searchTerm}
                placeholder={searchPlaceholder}
                className="block text-sm border-0 rounded-t-md focus:ring-0 focus:border-green-700 flex-1"
                onChange={handleSearch}
              />
              {searchTerm && (
                <button type="button" onClick={resetSearch} className="px-2 py-1">
                  <XIcon className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          )}
          {!loading && (
            <Tree
              autoExpandParent
              checkable={multiple}
              selectable={!multiple}
              multiple={multiple}
              selectedKeys={selectedKeys}
              expandedKeys={expandedKeys}
              checkedKeys={checkedKeys}
              switcherIcon={customSwitcherIcon}
              onExpand={handleExpand}
              onSelect={handleSelect}
              onCheck={handleCheck}
            >
              {renderTreeNodes(optionsResult)}
            </Tree>
          )}
          {optionsResult.length === 0 && searchTerm && (
            <div className="p-2 text-sm">No results</div>
          )}
        </div>
      </Transition>
    </div>
  );
};

export default TreeSelect;
