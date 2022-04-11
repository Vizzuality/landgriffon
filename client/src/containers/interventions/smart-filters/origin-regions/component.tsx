import { useMemo } from 'react';
import TreeSelect from 'components/tree-select';
import { sortBy } from 'lodash';

import { useAdminRegionsTrees, AdminRegionsTreesParams } from 'hooks/admin-regions';
import type { TreeSelectProps } from 'components/tree-select/types';

type OriginRegionsFilterProps = {
  current: TreeSelectProps['current'];
  multiple?: TreeSelectProps['multiple'];
  /** Tree depth. Defaults to `1` */
  depth?: AdminRegionsTreesParams['depth'];
  /** Only regions with sourcing locations. */
  withSourcingLocations?: AdminRegionsTreesParams['withSourcingLocations'];
  businessUnitIds?: AdminRegionsTreesParams['businessUnitIds'];
  supplierIds?: AdminRegionsTreesParams['supplierIds'];
  materialIds?: AdminRegionsTreesParams['materialIds'];
  onChange?: TreeSelectProps['onChange'];
  theme?: 'default' | 'inline-primary';
  ellipsis?: TreeSelectProps['ellipsis'];
  error?: TreeSelectProps['error'];
  fitContent?: TreeSelectProps['fitContent'];
};

const OriginRegionsFilter: React.FC<OriginRegionsFilterProps> = ({
  multiple,
  current,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  materialIds,
  supplierIds,
  businessUnitIds,
  onChange,
  theme,
  ellipsis,
  error,
  fitContent,
  ...props
}) => {
  const { data, isFetching } = useAdminRegionsTrees({
    depth,
    withSourcingLocations,
    materialIds,
    supplierIds,
    businessUnitIds,
  });

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
      {...props}
      multiple={multiple}
      showSearch
      loading={isFetching}
      options={treeOptions}
      placeholder="sourcing regions"
      onChange={onChange}
      current={current}
      theme={theme}
      ellipsis={ellipsis}
      error={error}
      fitContent={fitContent}
    />
  );
};

export default OriginRegionsFilter;
