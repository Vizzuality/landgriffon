import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import { useMaterialsTrees } from 'hooks/materials';

import TreeSelect from 'components/tree-select';

import type { TreeSelectProps } from 'components/tree-select/types';

type MaterialsFilterProps = {
  current: TreeSelectProps['current'];
  multiple?: TreeSelectProps['multiple'];
  onChange?: TreeSelectProps['onChange'];
};

const MaterialsFilter: React.FC<MaterialsFilterProps> = ({ multiple, current, onChange }) => {
  const { data, isFetching } = useMaterialsTrees({ depth: 1 });

  const treeOptions: TreeSelectProps['options'] = useMemo(
    () =>
      sortBy(
        data?.map(({ name, id, children }) => ({
          label: name,
          value: id,
          children: children?.map(({ name, id }) => ({ label: name, value: id })),
        })),
        'label',
      ),
    [data],
  );

  return (
    <TreeSelect
      multiple={multiple}
      showSearch
      loading={isFetching}
      options={treeOptions}
      placeholder="Materials"
      onChange={onChange}
      current={current}
    />
  );
};

export default MaterialsFilter;
