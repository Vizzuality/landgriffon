import { useCallback, useMemo } from 'react';
import { TreeSelect, TreeSelectProps } from 'antd';
import { ChevronDownIcon, XIcon } from '@heroicons/react/solid';
import { sortBy } from 'lodash';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setFilter } from 'store/features/analysis';
import { useAdminRegionsTrees } from 'hooks/admin-regions';

type OriginRegionsFilterProps = TreeSelectProps<unknown>;

const OriginRegionsFilter: React.FC<OriginRegionsFilterProps> = (
  props: OriginRegionsFilterProps,
) => {
  const { multiple } = props;
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(analysis);
  const { data, isLoading, error } = useAdminRegionsTrees({ depth: 1 });

  const handleChange = useCallback(
    (selected) => dispatch(setFilter({ id: 'origins', value: [selected] })),
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
      placeholder={error ? 'Something went wrong' : 'Select origin regions'}
      value={multiple ? filters.origins : filters.origins[0]}
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

export default OriginRegionsFilter;
