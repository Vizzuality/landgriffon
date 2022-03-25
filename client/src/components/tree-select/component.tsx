import { Fragment, useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { useOutsideClick } from 'rooks';
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
import { CHECKED_STRATEGIES } from './utils';

import type { TreeSelectProps, TreeSelectOption } from './types';

const THEMES = {
  default: {
    label: 'text-gray-300',
    wrapper:
      'flex-wrap w-full bg-white relative border border-gray-300 rounded-md shadow-sm py-2 pr-10 pl-3 cursor-pointer',
    arrow: 'inset-y-0 right-0 items-center pr-2  text-gray-900',
    treeNodes:
      'flex items-center space-x-2 px-1 py-2 whitespace-nowrap text-sm cursor-pointer hover:bg-green-50 hover:text-green-700',
  },
  'inline-primary': {
    label: 'truncate text-ellipsis font-bold cursor-pointer px-0 py-0',
    wrapper: 'border-b-2 border-green-700 max-w-[190px] overflow-x-hidden truncate text-ellipsis',
    arrow: '-bottom-3  transform left-1/2 -translate-x-1/2 text-green-700',
    treeNodes:
      'flex items-center space-x-2 px-1 py-2 whitespace-nowrap text-sm cursor-pointer hover:bg-green-50 hover:text-green-700',
    treeContent: 'max-w-xl',
  },
};

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
  theme = 'default',
  ellipsis = false,
  fitContent = false,
  checkedStrategy = 'CHILD', // by default show child
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selected, setSelected] = useState<TreeSelectOption>(null);
  const [selectedKeys, setSelectedKeys] = useState<TreeProps['selectedKeys']>([]);
  const [expandedKeys, setExpandedKeys] = useState<TreeProps['expandedKeys']>([]);
  const [checkedKeys, setCheckedKeys] = useState<TreeProps['checkedKeys']>([]);

  const wrapperRef = useRef();

  const renderTreeNodes = useMemo(
    () =>
      (data, counter = 0) =>
        data.map((item) => (
          <TreeNode
            key={item.value}
            title={item.label}
            className={classNames(THEMES[theme].treeNodes, {
              'bg-green-50 text-green-700 font-semibold': selectedKeys.includes(item.value),
            })}
            style={{ paddingLeft: 16 * counter }}
          >
            {item.children && renderTreeNodes(item.children, counter + 1)}
          </TreeNode>
        )),
    [selectedKeys, theme],
  );

  const customSwitcherIcon = useCallback(({ isLeaf, expanded }) => {
    if (isLeaf) return <span className="block w-4" />;
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

      // Depending of the checked strategy apply different filters
      const filteredValues = CHECKED_STRATEGIES[checkedStrategy](checkedKeys, checkedNodes);

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
    [checkedStrategy, onChange, options],
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

  const Arrow = () => (
    <span className={classNames('absolute flex pointer-events-none', THEMES[theme].arrow)}>
      {isOpen ? (
        <ChevronUpIcon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      )}
    </span>
  );

  // Current selection
  useEffect(() => {
    // Clear selection when current is empty
    if (current && current.length === 0) {
      setSelected(null);
      setSelectedKeys([]);
      setCheckedKeys([]);
    }
    if (current && current.length) {
      const currentKeys = current.map(({ value }) => value);
      setSelected(current[0]);
      setSelectedKeys(currentKeys);
      setCheckedKeys(currentKeys);
    }
  }, [current]);

  useOutsideClick(wrapperRef, () => {
    setIsOpen(false);
  });

  return (
    <div ref={wrapperRef} className="relative">
      {multiple ? (
        <div className="flex align-center relative" onClick={handleToggleOpen}>
          <div
            className={classNames('flex', THEMES[theme].wrapper, {
              'ring-green-700 border-green-700': isOpen,
            })}
          >
            {currentOptions &&
              !!currentOptions.length &&
              !ellipsis &&
              currentOptions.slice(0, maxBadges).map((option) => (
                <Badge
                  key={option.value}
                  className={classNames('text-sm m-0.5', THEMES[theme].label)}
                  data={option}
                  onClick={handleRemoveBadget}
                  removable={theme === 'inline-primary' ? false : true}
                  theme={theme}
                >
                  {option.label}
                </Badge>
              ))}
            {currentOptions && !!currentOptions.length && ellipsis && (
              <Badge
                key={currentOptions[0].value}
                className={classNames('text-sm m-0.5', THEMES[theme].label)}
                data={currentOptions[0]}
                onClick={handleRemoveBadget}
                removable={theme === 'inline-primary' ? false : true}
                theme={theme}
              >
                {currentOptions[0].label}
              </Badge>
            )}
            {currentOptions && currentOptions.length > maxBadges && (
              <Badge className={classNames('text-sm m-0.5', THEMES[theme].label)} theme={theme}>
                {currentOptions.length - maxBadges} more selected
              </Badge>
            )}
            {(!currentOptions || currentOptions.length === 0) && (
              <span className="inline-block truncate">
                {placeholder && (
                  <span className={classNames('text-sm', THEMES[theme].label)}>{placeholder}</span>
                )}
              </span>
            )}
          </div>
          <Arrow />
        </div>
      ) : (
        <button
          type="button"
          className={classNames(
            'bg-white relative w-full flex align-center border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 text-sm cursor-pointer',
            { 'ring-green-700 border-green-700': isOpen },
          )}
          onClick={handleToggleOpen}
        >
          <span className="inline-block truncate">
            {selected ? (
              <span className="font-medium">{selected.label}</span>
            ) : (
              <span className="text-gray-300">{placeholder}</span>
            )}
          </span>
          <Arrow />
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
        <div
          className={classNames(
            'absolute z-20 min-w-full max-h-96 bg-white shadow-lg rounded-md mt-1 ring-1 ring-black ring-opacity-5 overflow-y-auto overflow-x-hidden',
            { 'left-0 right-0': fitContent },
          )}
        >
          {loading && (
            <div className="p-4">
              <Loading className="text-green-700 -ml-1 mr-3" />
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
              checkStrictly={false}
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
