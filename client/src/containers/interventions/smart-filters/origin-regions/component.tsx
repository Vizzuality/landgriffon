import { useMemo } from 'react';
import TreeSelect from 'components/tree-select';
import { sortBy } from 'lodash';

import { useAdminRegionsTrees, AdminRegionsTreesParams } from 'hooks/admin-regions';
import type { TreeSelectProps } from 'components/tree-select/types';

// form validation
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schemaValidation = yup.object({
  originRegions: yup.array().of(yup.string()).min(1).required(),
});

type OriginRegionsFilterProps = {
  current: TreeSelectProps['current'];
  multiple?: TreeSelectProps['multiple'];
  /** Tree depth. Defaults to `1` */
  depth?: AdminRegionsTreesParams['depth'];
  /** Only regions with sourcing locations. */
  withSourcingLocations?: AdminRegionsTreesParams['withSourcingLocations'];
  onChange?: TreeSelectProps['onChange'];
  theme?: 'default' | 'inline-primary';
  ellipsis?: TreeSelectProps['ellipsis'];
  fitContent?: TreeSelectProps['fitContent'];
};

const OriginRegionsFilter: React.FC<OriginRegionsFilterProps> = ({
  multiple,
  current,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  onChange,
  theme,
  ellipsis,
  fitContent,
}) => {
  const { data, isFetching } = useAdminRegionsTrees({ depth, withSourcingLocations });

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


  const {
    register,
    control,
    getValues,
    formState: { isValid, errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  return (
    <TreeSelect
      {...register('originRegions')}
      multiple={multiple}
      showSearch
      loading={isFetching}
      options={treeOptions}
      placeholder="Sourcing regions"
      onChange={onChange}
      current={current}
      theme={theme}
      ellipsis={ellipsis}
      fitContent={fitContent}
    />
  );
};

export default OriginRegionsFilter;
