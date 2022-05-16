import { Fragment, useCallback, useState, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import { Transition, Popover } from '@headlessui/react';
import { offset, useFloating } from '@floating-ui/react-dom';
import { ChevronDownIcon, XIcon, SearchIcon } from '@heroicons/react/solid';
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
  error = false,
  fitContent = false,
  checkedStrategy = 'PARENT', // by default show child
  name,
}) => {
  const {
    x,
    y,
    reference,
    floating,
    strategy,
    refs: { reference: referenceElement },
  } = useFloating({
    placement: 'bottom-start',
    middleware: [offset({ mainAxis: 4 })],
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selected, setSelected] = useState<TreeSelectOption>(null);
  const [selectedKeys, setSelectedKeys] = useState<TreeProps['selectedKeys']>([]);
  const [expandedKeys, setExpandedKeys] = useState<TreeProps['expandedKeys']>([]);
  const [checkedKeys, setCheckedKeys] = useState<TreeProps['checkedKeys']>([]);
  const [filteredKeys, setFilteredKeys] = useState([]);

  const renderTreeNodes = useMemo(
    () =>
      (data, counter = 0) =>
        data.map((item) => (
          <TreeNode
            data-cy="tree-node"
            key={item.value}
            title={item.label}
            className={classNames(THEMES[theme].treeNodes, {
              hidden: searchTerm !== '' && !filteredKeys.includes(item.value),
              'bg-green-50 text-green-700 font-semibold': selectedKeys.includes(item.value),
            })}
            style={{ paddingLeft: 16 * counter }}
          >
            {item.children && renderTreeNodes(item.children, counter + 1)}
          </TreeNode>
        )),
    [filteredKeys, searchTerm, selectedKeys, theme],
  );

  const customSwitcherIcon = useCallback(({ isLeaf, expanded }) => {
    if (isLeaf) return <span className="block w-4" />;

    return <ChevronDownIcon className={classNames('h-4 w-4', { '-rotate-90': !expanded })} />;
  }, []);

  const handleExpand: TreeProps['onExpand'] = useCallback((keys) => setExpandedKeys(keys), []);

  // Selection for non-multiple
  const handleSelect: TreeProps['onSelect'] = useCallback(
    (keys, { node }) => {
      const currentSelection = { label: node.title as string, value: node.key };
      setSelectedKeys(keys);
      setSelected(currentSelection);
      onChange?.(currentSelection);
    },
    [onChange],
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

      onChange?.(checkedOptions);
      setCheckedKeys(filteredValues);
    },
    [checkedStrategy, onChange, options],
  );

  // Search capability
  const fuse = useMemo(() => new Fuse(options, SEARCH_OPTIONS), [options]);
  const handleSearch = useCallback(
    (e) => {
      setSearchTerm(e.currentTarget.value);
      onSearch?.(e.currentTarget.value);
    },
    [onSearch],
  );
  const resetSearch = useCallback(() => setSearchTerm(''), []);
  useEffect(() => {
    if (searchTerm && searchTerm !== '') {
      // TO-DO: investigate if there is a better way for nesting search and Fuse.js
      const filteredOptions = fuse.search(searchTerm).map(({ item }) => {
        if (!item.children || item.children.length === 0) return item;
        const fuseChildren = new Fuse(item.children, SEARCH_OPTIONS);
        const childrenResult = fuseChildren.search(searchTerm);
        return {
          ...item,
          children: childrenResult.map(({ item: itemChildren }) => itemChildren),
        };
      });
      setFilteredKeys(filteredOptions.flatMap(flattenKeys));
    }
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

      onChange?.(checkedOptions);
      setCheckedKeys(filteredKeys);
    },
    [checkedKeys, onChange, options],
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

  return (
    <Popover className="relative" data-cy={name ? `${name}-select` : null}>
      {({ open }) => (
        <>
          {multiple ? (
            <Popover.Button
              data-cy={name ? `${name}-select-button` : null}
              ref={reference}
              className="w-full flex align-center relative"
            >
              <div
                className={classNames('flex', THEMES[theme].wrapper, {
                  'ring-green-700 border-green-700': open,
                  'border-red-600': !!error,
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
                      <span className={classNames('text-sm', THEMES[theme].label)}>
                        {placeholder}
                      </span>
                    )}
                  </span>
                )}
              </div>
              <span
                className={classNames('absolute flex pointer-events-none', THEMES[theme].arrow, {
                  'text-red-700': !!error,
                })}
              >
                <ChevronDownIcon
                  className={classNames('h-4 w-4', { 'rotate-180': open })}
                  aria-hidden="true"
                />
              </span>
            </Popover.Button>
          ) : (
            <Popover.Button
              data-cy={name ? `${name}-select-button` : null}
              ref={reference}
              className={classNames(
                'bg-white relative w-full flex align-center border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-green-700 focus:border-green-700 text-sm cursor-pointer',
                { 'ring-green-700 border-green-700': open },
              )}
            >
              <span className="inline-block truncate">
                {selected ? (
                  <span className="font-medium">{selected.label}</span>
                ) : (
                  <span className="text-gray-300">{placeholder}</span>
                )}
              </span>
              <span
                className={classNames('absolute flex pointer-events-none', THEMES[theme].arrow, {
                  'text-red-700': !!error,
                })}
              >
                <ChevronDownIcon
                  className={classNames('h-4 w-4', { 'rotate-180': open })}
                  aria-hidden="true"
                />
              </span>
            </Popover.Button>
          )}
          <div
            style={{
              position: strategy,
              top: y ?? '',
              left: x ?? '',
              width:
                fitContent && reference
                  ? (referenceElement.current as HTMLElement)?.offsetWidth
                  : 'inherit',
            }}
            className="z-10"
            ref={floating}
          >
            <Transition
              show={open}
              enter="transition duration-100 ease-out"
              enterFrom="transform opacity-0"
              enterTo="transform opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform opacity-100"
              leaveTo="transform opacity-0"
            >
              <Popover.Panel
                data-cy={name ? `${name}-select-content` : null}
                static
                className={classNames(
                  'z-20 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 max-h-80 overflow-y-auto',
                  fitContent ? 'max-w-full' : 'max-w-md',
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
                    {renderTreeNodes(options)}
                  </Tree>
                )}
                {filteredKeys.length === 0 && searchTerm && (
                  <div className="p-2 text-sm">No results</div>
                )}
              </Popover.Panel>
            </Transition>
          </div>
        </>
      )}
    </Popover>
  );
};

const flattenKeys: (root: TreeSelectOption) => TreeSelectOption['value'][] = (root) => {
  const keys: TreeSelectOption['value'][] = [root.value];
  if (root.children) {
    keys.push(...root.children.flatMap(flattenKeys));
  }

  return keys;
};

export default TreeSelect;
