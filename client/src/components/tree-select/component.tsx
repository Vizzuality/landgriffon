import {
  Fragment,
  useCallback,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  ChangeEventHandler,
} from 'react';
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
} from '@floating-ui/react-dom-interactions';
import { ChevronDownIcon, XIcon, SearchIcon } from '@heroicons/react/solid';
import Tree, { TreeNode, TreeProps } from 'rc-tree';
import Fuse from 'fuse.js';

import Badge from 'components/badge';
import Loading from 'components/loading';
import { CHECKED_STRATEGIES } from './utils';

import type { TreeSelectProps, TreeSelectOption } from './types';
import { Transition } from '@headlessui/react';

const THEMES = {
  default: {
    label: 'text-gray-300',
    wrapper:
      'flex-row max-w-full bg-white relative border border-gray-300 rounded-md shadow-sm px-3 cursor-pointer min-h-[2.5rem] h-min py-1 text-sm',
    arrow: 'items-center text-gray-900',
    treeNodes:
      'flex items-center space-x-2 px-1 py-2 whitespace-nowrap text-sm cursor-pointer hover:bg-green-50 hover:text-green-700 z-[100]',
  },
  'inline-primary': {
    label: 'truncate text-ellipsis font-bold cursor-pointer px-0 py-0',
    wrapper:
      'min-h-[2rem] border-b-2 flex-col border-green-700 max-w-[190px] min-w-[30px] overflow-x-hidden truncate text-ellipsis',
    arrow: 'mx-auto w-fit',
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
  showSearch = false,
  onChange,
  onSearch,
  theme = 'default',
  ellipsis = false,
  error = false,
  fitContent = false,
  checkedStrategy = 'PARENT', // by default show child
  label,
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(autoFocus && (!current || current.length === 0));

  const badgesToShow = ellipsis ? 1 : maxBadges;

  const {
    x,
    y,
    reference,
    floating,
    strategy,
    update,
    refs: { reference: referenceElement },
    context,
  } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset({ mainAxis: 4 }), shift({ padding: 4 }), flip()],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context, {}),
    useRole(context, { role: 'listbox' }),
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selected, setSelected] = useState<TreeSelectOption>(null);
  const [selectedKeys, setSelectedKeys] = useState<TreeProps['selectedKeys']>([]);
  const [expandedKeys, setExpandedKeys] = useState<TreeProps['expandedKeys']>([]);
  const [checkedKeys, setCheckedKeys] = useState<TreeProps['checkedKeys']>([]);
  const [filteredKeys, setFilteredKeys] = useState([]);

  useLayoutEffect(() => {
    // Update tooltip position when selection changes
    update();
  }, [checkedKeys, update, multiple, fitContent]);

  const renderTreeNodes = useCallback(
    (data, counter = 0) =>
      data.map((item) => (
        <TreeNode
          key={item.value}
          title={item.label}
          className={classNames(THEMES[theme].treeNodes, {
            'w-full': fitContent,
            hidden: searchTerm !== '' && !filteredKeys.includes(item.value),
            'bg-green-50 text-green-700 font-semibold': selectedKeys.includes(item.value),
          })}
          style={{ paddingLeft: 16 * counter }}
        >
          {item.children && renderTreeNodes(item.children, counter + 1)}
        </TreeNode>
      )),
    [filteredKeys, fitContent, searchTerm, selectedKeys, theme],
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
      setIsOpen(false);
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
  const handleSearch: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      e.stopPropagation();
      setSearchTerm(e.currentTarget.value);
      onSearch?.(e.currentTarget.value);
      setIsOpen(true);
      e.currentTarget.focus();
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

  const handleRemoveBadge = useCallback(
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
    <div>
      {/*
        Button instead of div so the select doesn't toggle on space key press,
        allowing spaces in the search
      */}
      <button
        {...getReferenceProps({
          ref: reference,
        })}
        className={classNames(
          'relative w-full',
          {
            [THEMES[theme].wrapper]: theme === 'default',
            'flex flex-row justify-between items-center gap-1': theme === 'default',
            'border-2 border-red-600': theme === 'default' && error,
            'w-fit': theme === 'inline-primary',
          },
          { 'w-fit': theme === 'inline-primary' },
        )}
      >
        <div
          className={classNames('flex gap-1 h-min flex-wrap overflow-hidden', {
            'ring-green-700 border-green-700': isOpen,
            'border-red-600': theme === 'inline-primary' && error,
            [THEMES[theme].wrapper]: theme === 'inline-primary',
          })}
        >
          {label && <span className={classNames(THEMES[theme].label)}>{label}</span>}
          {multiple ? (
            <>
              {(!currentOptions || !currentOptions.length) && !showSearch && (
                <span className="inline-block text-sm text-gray-500 truncate">{placeholder}</span>
              )}
              {!!currentOptions?.length &&
                currentOptions.slice(0, badgesToShow).map((option) => (
                  <Badge
                    key={option.value}
                    className={classNames('text-sm h-fit my-auto max-w-full', THEMES[theme].label)}
                    data={option}
                    onClick={handleRemoveBadge}
                    removable={theme !== 'inline-primary'}
                    theme={theme}
                  >
                    {option.label}
                  </Badge>
                ))}
              {currentOptions?.length > badgesToShow && (
                <Badge
                  className={classNames('text-sm h-fit my-auto', THEMES[theme].label)}
                  theme={theme}
                >
                  {currentOptions.length - badgesToShow} more selected
                </Badge>
              )}
            </>
          ) : (
            <span className="inline-block my-auto truncate">
              {selected ? (
                <span className="font-medium">{selected.label}</span>
              ) : (
                // the placeholder is in the search input already
                showSearch || <span className="text-gray-500">{placeholder}</span>
              )}
            </span>
          )}
          {showSearch && (
            <div className="inline-flex flex-row flex-grow h-min gap-x-1">
              <SearchIcon className="block w-4 h-4 my-auto text-gray-400" />
              <input
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                }}
                type="search"
                value={searchTerm}
                placeholder={currentOptions.length === 0 && selected === null ? placeholder : null}
                className="px-0 py-0 text-sm truncate border-none focus:ring-0"
                onChange={handleSearch}
                autoComplete="off"
                style={{
                  minWidth:
                    searchTerm || currentOptions.length !== 0 ? '4ch' : `${placeholder.length}ch`,
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
          )}
        </div>
        <div
          className={classNames('flex pointer-events-none h-fit', THEMES[theme].arrow, {
            'text-red-700': !!error,
          })}
        >
          {theme === 'inline-primary' ? (
            <div
              className={classNames(
                'mt-0.5 border-t-green-700 border-t-4 border-x-4 border-x-transparent mx-auto w-0 h-0',
                { 'border-t-red-600': error },
              )}
            />
          ) : (
            <ChevronDownIcon
              className={classNames('h-4 w-4', { 'rotate-180': isOpen })}
              aria-hidden="true"
            />
          )}
        </div>
      </button>
      <Transition
        show={isOpen}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
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
          className={classNames(
            'bg-white max-h-80 overflow-y-auto',
            fitContent ? 'max-w-full w-full' : 'max-w-xs',
          )}
        >
          {loading && (
            <div className="p-4">
              <Loading className="mr-3 -ml-1 text-green-700" />
            </div>
          )}
          {!loading && (
            <>
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
              {(options.length === 0 || (searchTerm && filteredKeys.length === 0)) && (
                <div className="p-2 mx-auto text-sm text-gray-700 opacity-60 w-fit">No results</div>
              )}
            </>
          )}
        </div>
      </Transition>
    </div>
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
