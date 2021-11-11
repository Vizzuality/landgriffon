import React, { useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import { TreeSelect, TreeSelectProps } from 'antd';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';
import sortBy from 'lodash.sortby';

import { getMaterialsTrees } from 'services/materials';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';

const { TreeNode } = TreeSelect;

type MaterialsFilterProps = TreeSelectProps<unknown>;

const MaterialsFilter: React.FC<MaterialsFilterProps> = (props: MaterialsFilterProps) => {
  const { multiple } = props;
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(analysis);
  const { data, isLoading, error } = useQuery('materialsTreesList', getMaterialsTrees);

  const handleChange = useCallback(
    (selected) => dispatch(setFilter({ id: 'materials', value: [selected] })),
    [dispatch],
  );

  const treeData = useMemo(
    () =>
      sortBy(
        data?.map(({ name, id, children }) => ({
          label: name,
          key: id,
          children: children?.map(({ name, id }) => ({ label: name, key: id })),
        })),
        'label',
      ),
    [data],
  );

  return (
    <TreeSelect
      onChange={handleChange}
      labelInValue
      className="w-64"
      loading={isLoading}
      placeholder={error ? 'Something went wrong' : 'Select materials'}
      value={multiple ? filters.materials : filters.materials[0]}
      multiple={false}
      treeData={treeData}
      showArrow
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      treeDefaultExpandAll={false}
      treeCheckable={false}
      disabled={!!error}
      treeNodeFilterProp="title"
      suffixIcon={<ChevronDownIcon />}
      removeIcon={<XIcon />}
      maxTagCount={5}
      maxTagPlaceholder={(e) => `${e.length} more...`}
      showSearch
      {...props}
    />
  );
};

export default MaterialsFilter;
