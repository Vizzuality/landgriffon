import Fuse from 'fuse.js';
import { useQuery } from '@tanstack/react-query';
import { useId, useMemo } from 'react';
import { sortBy } from 'lodash-es';
import { flattenTreeData } from 'rc-tree/lib/utils/treeUtil';

import { FIELD_NAMES } from './constants';

import { splitStringByIndexes } from 'utils/string';

import type { DeepKeys } from '@tanstack/react-table';
import type { TreeDataNode, TreeSelectOption } from './types';
import type { DataNode, Key } from 'rc-tree/lib/interface';

interface HasChildren<T> {
  children?: T[];
}

const ALL = (checkedKeys: Key[], checkedNodes: TreeDataNode[]): DataNode['key'][] =>
  checkedNodes.map(({ value }) => value);

const PARENT = (checkedKeys: Key[], checkedNodes: TreeDataNode[]): TreeDataNode['value'][] => {
  // 1. Extracting parents selected
  const parentsWithChildren = checkedNodes.filter((node) => !!node?.children);
  // 2. Extracting children ids from parents selected above
  const childrenWithParents = [];
  if (parentsWithChildren && parentsWithChildren.length) {
    parentsWithChildren.forEach(({ children }) =>
      children.forEach(({ value }) => childrenWithParents.push(value)),
    );
  }
  // 3. Filtering checkedKeys with children ids to not send unnecessary values
  const filteredValues =
    childrenWithParents && childrenWithParents.length
      ? checkedKeys.filter((key) => !childrenWithParents.includes(key))
      : checkedKeys;
  return filteredValues;
};

const CHILD = (checkedKeys: Key[], checkedNodes: TreeDataNode[]): TreeDataNode['value'][] => {
  const onlyChildren = checkedNodes.filter((node) => !node?.children).map(({ value }) => value);
  return onlyChildren;
};

export const CHECKED_STRATEGIES = { ALL, PARENT, CHILD };

export const flattenTree = <T extends HasChildren<T>>(tree: T) => {
  const flattenedTree = [tree];
  if (tree.children) {
    flattenedTree.push(...tree.children.flatMap((child) => flattenTree(child)));
  }

  return flattenedTree;
};

export const getParents = <T extends { parent?: T }>(node: T): T[] => {
  if (!node.parent) {
    return [];
  }
  const parent = node.parent;
  return [parent, ...getParents(parent)];
};

const filterTree = <T extends HasChildren<T>>(
  tree: T,
  filter: (node: T) => boolean,
  depth = 0,
): T | null => {
  const isValid = filter(tree);

  // base case: filter a leaf node
  if (!tree.children || tree.children.length === 0) {
    const value = isValid ? tree : null;
    return value;
  }

  // filter all children, get the valid ones
  const filteredChildren = tree.children
    .map((child) => filterTree(child, filter, depth + 1))
    .filter(Boolean);

  // if no children is valid, return the parent without children, ONLY if it's valid itself
  if (filteredChildren.length === 0) {
    return isValid ? { ...tree, index: depth, children: [] } : null;
  }

  return {
    ...tree,
    children: filteredChildren,
  };
};

const recursiveSortHelper = <T extends HasChildren<T>>(
  value: T,
  selector: ((value: T) => unknown) | DeepKeys<T>,
): T => {
  const children = value.children?.map((child) => recursiveSortHelper(child, selector));
  return { ...value, children: sortBy(children, selector) };
};

export const recursiveSort = <T extends HasChildren<T>>(
  values: T[],
  selector: ((value: T) => unknown) | DeepKeys<T>,
): T[] => {
  return sortBy(values, selector).map((value) => recursiveSortHelper(value, selector));
};

export const recursiveMap = <T extends HasChildren<T>, V extends Record<keyof unknown, unknown>>(
  value: T,
  mapper: (value: T) => V & HasChildren<V>,
): V => {
  const mappedValue = mapper(value);

  const children = value.children
    ? value.children?.map((child) => recursiveMap(child, mapper))
    : [];

  return {
    ...mappedValue,
    children,
  };
};

const getFilteredOptions = (options: TreeSelectOption[], search?: string) => {
  const filteredOptions = search
    ? options
        .map((opt) =>
          filterTree(opt, (node) => {
            const fuse = new Fuse([node], {
              includeScore: false,
              keys: ['label'],
              threshold: 0.4,
            });
            return fuse.search(search).length > 0;
          }),
        )
        .filter(Boolean)
    : options;

  return filteredOptions;
};

interface UseTreeOptions {
  render: (node: Omit<TreeDataNode, 'className'>) => TreeDataNode;
  isOptionSelected: (id: Key) => boolean;
}

const optionToTreeData = (
  option: TreeSelectOption,
  render: UseTreeOptions['render'],
  depth = 0,
): TreeDataNode => {
  const children = option.children?.map((option) => optionToTreeData(option, render, depth + 1));
  return render({
    ...option,
    style: { paddingLeft: 16 * depth },
    children,
  });
};

export const useTree = (
  options: TreeSelectOption[],
  search = '',
  { render, isOptionSelected }: UseTreeOptions,
) => {
  const id = useId();

  const { data: filteredKeys } = useQuery({
    queryKey: ['filtered-keys', id, options, search] as const,
    queryFn: ({ queryKey: [, , options, search] }) => {
      const filteredOptions = getFilteredOptions(options, search);
      const keys = filteredOptions.flatMap((opt) => flattenTree(opt).map((opt) => opt.value));
      return keys;
    },
  });

  const { data: treeData } = useQuery({
    queryKey: ['tree-data', id, options],
    queryFn: () => options.map((option) => optionToTreeData(option, render)),
    placeholderData: [],
  });

  const { data: flatTreeData } = useQuery({
    // treeData is a circular dependency
    queryKey: ['flattened-options', id, treeData.map((opt) => opt.value)],
    queryFn: () => {
      const flattened = flattenTreeData(treeData, true, FIELD_NAMES);
      return flattened;
    },
    placeholderData: [],
    enabled: !!treeData?.length,
  });

  const fuse = useMemo(
    () =>
      new Fuse(flatTreeData, {
        includeScore: false,
        keys: ['title'],
        threshold: 0.4,
        includeMatches: true,
      }),
    [flatTreeData],
  );

  const { data: filteredOptions } = useQuery({
    queryKey: ['filtered-options', id, search, flatTreeData.length] as const,
    queryFn: ({ queryKey: [, , search] }) => {
      const result = fuse.search(search);

      return result.map(({ item, matches }) => ({
        ...item,
        isSelected: isOptionSelected(item.key),
        matchingParts: splitStringByIndexes(matches[0].value, matches[0].indices),
      }));
    },
    placeholderData: [],
    enabled: !!flatTreeData?.length,
    refetchOnReconnect: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return { treeData, filteredKeys, flatTreeData, filteredOptions };
};
