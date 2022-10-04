import type { DataNode, Key } from 'rc-tree/lib/interface';

const ALL = (checkedKeys: Key[], checkedNodes: DataNode[]): DataNode['key'][] =>
  checkedNodes.map(({ key }) => key);

const PARENT = (checkedKeys: Key[], checkedNodes: DataNode[]): DataNode['key'][] => {
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
  return filteredValues;
};

const CHILD = (checkedKeys: Key[], checkedNodes: DataNode[]): DataNode['key'][] => {
  const onlyChildren = checkedNodes.filter((node) => !node?.children).map(({ key }) => key);
  return onlyChildren;
};

export const CHECKED_STRATEGIES = { ALL, PARENT, CHILD };
