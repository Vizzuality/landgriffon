import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  autoUpdate,
} from '@floating-ui/react-dom-interactions';
import { ChevronDownIcon, XIcon, SearchIcon } from '@heroicons/react/solid';
import Tree from 'rc-tree';
import { flattenTreeData } from 'rc-tree/lib/utils/treeUtil';
import { useDebouncedValue } from 'rooks';

import { CHECKED_STRATEGIES, getParents, useTree } from './utils';
import SearchOverlay from './search-overlay';
import { FIELD_NAMES } from './constants';

import Badge from 'components/badge';
import Loading from 'components/loading';

import type { Key } from 'rc-tree/lib/interface';
import type { TreeProps } from 'rc-tree';
import type { TreeSelectProps, TreeSelectOption, TreeDataNode } from './types';
import type { ChangeEventHandler, Ref } from 'react';

const THEMES = {
  default: {
    label: 'text-gray-900 text-xs',
    wrapper:
      'flex-row max-w-full bg-white relative border border-gray-200 transition-colors hover:border-gray-300 rounded-md shadow-sm px-3 cursor-pointer min-h-[2.5rem] h-min py-1 text-sm shadow-sm',
    arrow: 'items-center text-gray-900',
    treeNodes:
      'flex items-center space-x-2 px-1 py-2 whitespace-nowrap text-sm cursor-pointer hover:bg-navy-50 z-[100]',
    badge: 'text-sm',
  },
  'inline-primary': {
    label: 'truncate text-ellipsis font-bold cursor-pointer px-0 py-0',
    wrapper: 'inline-flex border-b-2 border-navy-400 max-w-none min-w-[30px] min-h-[26px]',
    arrow: 'mx-auto w-fit',
    treeNodes:
      'flex items-center space-x-2 px-1 py-2 whitespace-nowrap text-sm cursor-pointer hover:bg-navy-50',
    treeContent: 'max-w-xl',
    badge: '',
  },
};

const customSwitcherIcon: TreeProps<TreeDataNode>['switcherIcon'] = ({ isLeaf, expanded }) => {
  if (isLeaf) return <span className="block w-4" />;

  return <ChevronDownIcon className={classNames('h-4 w-4', { '-rotate-90': !expanded })} />;
};

const InnerTreeSelect = <IsMulti extends boolean>(
  {
    current: currentRaw,
    loading,
    maxBadges = 5,
    multiple,
    options = [],
    placeholder = '',
    showSearch = false,
    onChange,
    onSearch,
    theme = 'default',
    ellipsis = false,
    error = false,
    fitContent = false,
    checkedStrategy: checkedStrategyName = 'PARENT', // by default show child
    label,
    autoFocus = false,
    id,
  }: TreeSelectProps<IsMulti>,
  ref: Ref<HTMLInputElement>,
) => {
  const current = useMemo(() => {
    if (!currentRaw) {
      return null;
    }
    if (Array.isArray(currentRaw)) {
      return currentRaw;
    }
    return [currentRaw];
  }, [currentRaw]);
  const [isOpen, setIsOpen] = useState(autoFocus && (!current || current.length === 0));

  const checkedStrategy = CHECKED_STRATEGIES[checkedStrategyName];

  const listContainerRef = useRef<HTMLDivElement>(null);

  const badgesToShow = ellipsis ? 1 : maxBadges;

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    refs: { reference: referenceElement },
    context,
  } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset({ mainAxis: 4 }), shift({ padding: 4 }), flip()],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: 'listbox' }),
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useDebouncedValue(searchTerm, 100);

  const [selected, setSelected] = useState<TreeSelectOption>(null);
  const [selectedKeys, setSelectedKeys] = useState<TreeProps<TreeDataNode>['selectedKeys']>([]);
  const [expandedKeys, setExpandedKeys] = useState<TreeProps<TreeDataNode>['expandedKeys']>([]);

  const [checkedKeys, setCheckedKeys] = useState<Key[]>([]);

  const {
    filteredKeys: filteredOptionsKeys,
    filteredOptions,
    flatTreeData,
    treeData,
  } = useTree(options, debouncedSearch, {
    isOptionSelected: (key) => selectedKeys.includes(key),
    render: (node) => ({
      ...node,
      className: classNames(THEMES[theme].treeNodes, {
        'w-full': fitContent,
        'bg-navy-50 font-semibold': selectedKeys.includes(node.value),
      }),
    }),
  });

  const handleExpand: TreeProps<TreeDataNode>['onExpand'] = useCallback(
    (keys, { node, expanded }) => {
      // if the item is being closed, remove it from the expanded keys
      setExpandedKeys((prevKeys) => {
        const uniqueKeys = new Set(prevKeys);
        if (!expanded) {
          uniqueKeys.delete(node.key);
        } else {
          uniqueKeys.add(node.key);
        }
        return Array.from(uniqueKeys);
      });
    },
    [],
  );

  // Selection for non-multiple
  const handleSelect: TreeProps<TreeDataNode>['onSelect'] = useCallback(
    (keys, { node }) => {
      const currentSelection: TreeSelectOption = { label: node.label as string, value: node.value };
      setSelectedKeys(keys);
      setSelected(currentSelection);

      // TODO: move to effect
      if (!multiple) {
        // TODO: type inference is not working here
        onChange?.(currentSelection as TreeSelectProps<IsMulti>['current']);
      }
      setIsOpen(false);
    },
    [multiple, onChange],
  );

  const handleReset = useCallback(() => {
    setSelectedKeys([]);
    setCheckedKeys([]);
    setSelected(null);
    onChange?.(null);
  }, [onChange]);

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

  // Selection for multiple
  const handleCheck = useCallback<TreeProps<TreeDataNode>['onCheck']>(
    (checkedKeys: Key[], { checkedNodes }) => {
      // const root = fullTreeData.find((option) => checkedKeys.includes(option.key));
      // Depending of the checked strategy apply different filters
      const filteredValues = checkedStrategy(checkedKeys, checkedNodes) || [];

      // TODO: this function is repeated
      const checkedOptions: TreeSelectOption[] = [];
      filteredValues.forEach((key) => {
        const recursiveSearch = (arr: TreeSelectOption[]) => {
          arr.forEach((opt) => {
            if (opt.value === key) checkedOptions.push(opt);
            if (opt.children) recursiveSearch(opt.children);
          });
        };
        recursiveSearch(options);
      });

      if (multiple) {
        onChange?.(checkedOptions as TreeSelectProps<IsMulti>['current']);
      }
      setCheckedKeys(filteredValues);
    },
    [checkedStrategy, multiple, onChange, options],
  );

  // Search capability
  const handleSearch: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      e.stopPropagation();
      setSearchTerm(e.currentTarget.value);
      setIsOpen(true);
      onSearch?.(e.currentTarget.value);
    },
    [onSearch],
  );
  const resetSearch = useCallback(() => {
    setDebouncedSearch('');
    setSearchTerm('');
  }, [setDebouncedSearch]);

  const handleRemoveBadge = useCallback(
    (option: TreeSelectOption) => {
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

      if (multiple) {
        onChange?.(checkedOptions as TreeSelectProps<IsMulti>['current']);
      }
      setCheckedKeys(filteredKeys);
    },
    [checkedKeys, multiple, onChange, options],
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
      const currentKeys = (current as TreeSelectOption[]).map(({ value }) => value);
      setSelected(current[0]);
      setSelectedKeys(currentKeys);
      setCheckedKeys(currentKeys);
    }
  }, [current]);

  const SearchInput = useMemo(() => {
    const Component = () => (
      <div className="inline-flex flex-row flex-grow h-min gap-x-1">
        <SearchIcon className="block w-4 h-4 my-auto text-gray-400" />
        <input
          ref={ref}
          autoFocus
          type="search"
          value={searchTerm}
          placeholder={selected === null ? placeholder : null}
          className={classNames('px-0 py-0 truncate border-none focus:ring-0', {
            'text-sm min-w-fit': theme !== 'inline-primary',
          })}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          onKeyUp={(e) => {
            // Pressing space closes the selector, so the event is prevented in that case
            if (e.key !== ' ') return;
            e.stopPropagation();
            e.currentTarget.value += ' ';
          }}
          onChange={handleSearch}
          autoComplete="off"
          style={{
            minWidth: searchTerm || currentOptions.length !== 0 ? '4ch' : `${placeholder.length}ch`,
            maxWidth: '10ch',
            width: `${searchTerm.length}ch`,
          }}
        />
        {searchTerm && (
          <button type="button" onClick={resetSearch} className="px-2 py-0">
            <XIcon className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    );
    return Component;
  }, [
    currentOptions.length,
    handleSearch,
    placeholder,
    ref,
    resetSearch,
    searchTerm,
    selected,
    theme,
  ]);

  const [treeRef, setTreeRef] = useState<Tree<TreeDataNode>>();
  const [keyToScroll, setKeyToScroll] = useState<Key>();

  useEffect(() => {
    if (!listContainerRef.current || !keyToScroll) return;
    const listContainer = listContainerRef.current;

    const visibleFlattenedTreeData = flattenTreeData(treeData, expandedKeys, FIELD_NAMES);

    const elementIndex = visibleFlattenedTreeData.findIndex((node) => node.key === keyToScroll);

    if (elementIndex === -1) return;

    const listHeight = listContainer.clientHeight;

    // for some reason, there's an invisible .rc-tree-treenode outside of the list. With this selector we ensure to get the element only if it has a sibling of the same type
    const firstChild = listContainer.querySelector('.rc-tree-treenode ~ .rc-tree-treenode');
    const offset = firstChild.clientHeight;

    listContainer.scrollTop = offset * (elementIndex + 1) - listHeight / 2;
    setKeyToScroll(undefined);
  }, [keyToScroll, treeRef, treeData, expandedKeys]);

  const handleSearchSelection = useCallback(
    (newKey: Key) => {
      setSearchTerm('');
      setDebouncedSearch('');

      const selectedNode = flatTreeData.find((data) => data.key === newKey);
      setKeyToScroll(newKey);
      const parentKeys = getParents(selectedNode).map((node) => node.key);
      const keysToExpand = [selectedNode.key, ...parentKeys];
      setExpandedKeys((currentKeys) => {
        const uniqueKeys = new Set([...currentKeys, ...keysToExpand]);
        return Array.from(uniqueKeys);
      });

      if (multiple) {
        setCheckedKeys((currentKeys) => {
          const newKeys = new Set(currentKeys);
          if (newKeys.has(newKey)) {
            newKeys.delete(newKey);
          } else {
            newKeys.add(newKey);
          }
          return Array.from(newKeys);
        });
        setSelectedKeys((currentKeys) => {
          const newKeys = new Set(currentKeys);
          const shouldDelete = newKeys.has(newKey);
          if (shouldDelete) {
            newKeys.delete(newKey);
          } else {
            newKeys.add(newKey);
          }

          const keys = Array.from(newKeys);
          const newCheckedKeys = new Set([...checkedKeys, ...keys]);
          if (shouldDelete) {
            newCheckedKeys.delete(newKey);
          }
          const newCheckedNodes = flatTreeData
            .filter((data) => newCheckedKeys.has(data.key))
            .map(({ data }) => data);
          const filteredValuesKeys =
            checkedStrategy(Array.from(newCheckedKeys), newCheckedNodes) || [];
          const newNodes = flatTreeData
            .filter((data) => filteredValuesKeys.includes(data.key))
            .map(({ data }) => data);
          onChange?.(newNodes as TreeSelectProps<IsMulti>['current']);
          return keys;
        });
      } else {
        if (selected.value === selectedNode.key) {
          setSelected(null);
        } else {
          setSelected({ label: selectedNode.title as string, value: selectedNode.key });
        }
      }
    },
    [
      setDebouncedSearch,
      flatTreeData,
      multiple,
      checkedKeys,
      checkedStrategy,
      onChange,
      selected?.value,
    ],
  );

  return (
    <div className="min-w-0 " data-testid={`tree-select-${id}`}>
      <div
        {...getReferenceProps({
          ref: reference,
        })}
        className={classNames('relative w-full min-w-0', {
          [THEMES[theme].wrapper]: theme === 'default',
          'ring-[1.5px] ring-navy-400': theme === 'default' && isOpen && !error,
          'flex flex-row justify-between items-center gap-1': theme === 'default',
          'ring-1 ring-red-400': theme === 'default' && error,
          'w-fit': theme === 'inline-primary',
        })}
      >
        <div
          className={classNames('gap-1 h-min overflow-hidden', {
            'flex flex-wrap': theme !== 'inline-primary',
            'ring-navy-400 border-navy-400': isOpen,
            'border-red-400': theme === 'inline-primary' && error,
            [THEMES[theme].wrapper]: theme === 'inline-primary',
          })}
        >
          {label && <span className={classNames(THEMES[theme].label)}>{label}</span>}
          {multiple ? (
            <>
              {(!currentOptions || !currentOptions.length) && !showSearch && (
                <span className="inline-block text-gray-500 truncate">{placeholder}</span>
              )}
              {!!currentOptions?.length &&
                currentOptions.slice(0, badgesToShow).map((option, index) => (
                  <Badge
                    key={option.value}
                    className={classNames(
                      'h-fit my-auto max-w-full',
                      THEMES[theme].label,
                      THEMES[theme].badge,
                    )}
                    data={option}
                    onClick={handleRemoveBadge}
                    removable={theme !== 'inline-primary'}
                    theme={theme}
                  >
                    {option.label}
                    {theme === 'inline-primary' && index < currentOptions.length - 1 && ','}
                  </Badge>
                ))}
              {currentOptions?.length > badgesToShow && (
                <Badge
                  className={classNames('h-fit my-auto', THEMES[theme].label, THEMES[theme].badge)}
                  theme={theme}
                >
                  {currentOptions.length - badgesToShow} more selected
                </Badge>
              )}
            </>
          ) : (
            <div className="inline-flex items-center min-w-0 my-auto">
              {selected ? (
                <span className="min-w-0 font-bold truncate">{selected.label}</span>
              ) : (
                // the placeholder is in the search input already
                showSearch || <span className="text-gray-500">{placeholder}</span>
              )}
              {!selected && <SearchInput />}
              {selected && (
                <button type="button" onClick={handleReset} className="px-2 py-0">
                  <XIcon className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          )}
          {multiple && showSearch && <SearchInput />}
        </div>
        <div
          className={classNames('flex pointer-events-none h-fit', THEMES[theme].arrow, {
            'text-red-800': !!error,
          })}
        >
          {theme === 'inline-primary' ? (
            <div
              className={classNames(
                'mt-0.5 border-t-primary border-t-4 border-x-4 border-x-transparent mx-auto w-0 h-0',
                { 'border-t-red-400': error },
              )}
            />
          ) : (
            <ChevronDownIcon
              className={classNames('h-4 w-4', { 'rotate-180': isOpen })}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
      {isOpen && (
        <div
          {...getFloatingProps({
            style: {
              position: strategy,
              top: y ?? '',
              left: x ?? '',
              minWidth: multiple ? 150 : 100,
              width:
                fitContent && reference
                  ? (referenceElement.current as HTMLElement)?.offsetWidth
                  : 'inherit',
            },
            className:
              'relative z-20 rounded-md overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5',
            ref: floating,
          })}
        >
          <div
            ref={listContainerRef}
            className={classNames(
              'bg-white max-h-80 overflow-y-auto',
              fitContent ? 'max-w-full w-full' : 'max-w-xs',
            )}
          >
            {loading ? (
              <div className="p-4">
                <Loading className="w-5 mr-3 -ml-1 h5 text-navy-400" />
              </div>
            ) : debouncedSearch ? (
              <SearchOverlay onChange={handleSearchSelection} options={filteredOptions} />
            ) : (
              <>
                <Tree
                  ref={setTreeRef}
                  className={classNames({ hidden: loading || !!debouncedSearch })}
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
                  treeData={treeData}
                  fieldNames={FIELD_NAMES}
                />
                {(options.length === 0 || (searchTerm && filteredOptionsKeys.length === 0)) && (
                  <div className="p-2 mx-auto text-sm text-gray-600 opacity-60 w-fit">
                    No results
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TreeSelect = React.forwardRef(InnerTreeSelect) as <IsMulti extends boolean = false>(
  props: TreeSelectProps<IsMulti> & {
    ref?: Ref<HTMLInputElement>;
  },
) => React.ReactElement;

export default TreeSelect;
