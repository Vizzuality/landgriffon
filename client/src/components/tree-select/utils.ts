import Fuse from 'fuse.js';
import { useQuery } from '@tanstack/react-query';
import { useId, useMemo } from 'react';
import sortBy from 'lodash/sortBy';

import useFuse from 'hooks/fuse';

import type { DeepKeys } from '@tanstack/react-table';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { TreeDataNode, TreeSelectOption } from './types';
import type { DataNode, FlattenNode, Key } from 'rc-tree/lib/interface';

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

export const getParentKeys = <T>(node: FlattenNode<T>) => {
  if (!node.parent) {
    return [];
  }
  const parent = node.parent;
  return [parent.key, ...getParentKeys(parent)];
};

export const filterTree = <T extends HasChildren<T>>(
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

export const recursiveForEach = <T extends HasChildren<T>, V>(
  value: T,
  callback: (value: T) => V & { children?: V[] },
) => {
  callback(value);
  value.children?.forEach((child) => recursiveMap(child, callback));
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

export const useFilteredKeys = <T = TreeSelectOption['value'][]>(
  selectOptions: TreeSelectOption[],
  search: string,
  options?: UseQueryOptions<
    string[],
    unknown,
    T,
    [typeof id, typeof search, typeof selectOptions['length']]
  >,
) => {
  const enabled = !!search && (options?.enabled ?? true);
  const id = useId();
  const query = useQuery({
    queryKey: [id, search, selectOptions.length] as const,
    queryFn: ({ queryKey: [, search] }) => {
      if (!search) return [];
      const filteredOptions = getFilteredOptions(selectOptions, search);

      const keys = filteredOptions.flatMap((opt) => flattenTree(opt).map((opt) => opt.value));

      return keys;
    },
    placeholderData: [],
    keepPreviousData: true,
    ...options,
    enabled,
  });

  return query;
};

export const useFilteredOptions = (selectOptions: TreeSelectOption[], search: string) => {
  const flatOptions = useMemo(
    () => selectOptions.flatMap((opt) => flattenTree(opt)).map(({ children, ...rest }) => rest),
    [selectOptions],
  );
  const filteredOptions = useFuse(flatOptions, search, {
    includeScore: false,
    keys: ['label'],
    threshold: 0.4,
  });
  return filteredOptions;
};
