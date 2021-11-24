import React, { useCallback, useMemo } from 'react';
import { sortBy } from 'lodash';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';
import { useMaterialsTrees } from 'hooks/materials';

import TreeSelect from 'components/tree-select';

import type { TreeSelectProps } from 'components/tree-select/types';

const MaterialsFilter: React.FC<{ multiple?: boolean }> = (props) => {
  const { multiple = false } = props;
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(analysis);
  const { data, isLoading, error } = useMaterialsTrees({ depth: 1 });

  const handleChange = useCallback(
    (selected) => dispatch(setFilter({ id: 'materials', value: [selected] })),
    [dispatch],
  );

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
      loading={isLoading}
      options={treeOptions}
      placeholder="Materials"
      onChange={handleChange}
      current={filters.materials}
      // disabled={!!error}
      // labelInValue
      // className="w-64"
      // loading={isLoading}
      // placeholder={error ? 'Something went wrong' : 'Select materials'}
      // value={multiple ? filters.materials : filters.materials[0]}
      // treeData={treeData}
      // showArrow
      // showCheckedStrategy={TreeSelect.SHOW_PARENT}
      // treeDefaultExpandAll={false}
      // treeCheckable={false}
      // treeNodeFilterProp="title"
      // inputIcon={<ChevronDownIcon />}
      // removeIcon={<XIcon />}
      // maxTagCount={5}
      // maxTagPlaceholder={(e) => `${e.length} more...`}
      // showSearch
      // {...props}
    />
  );
};

export default MaterialsFilter;
