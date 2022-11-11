import React, { useMemo } from 'react';
import { sortBy } from 'lodash-es';

// hooks
import { useLocationTypes } from 'hooks/location-types';
import TreeSelect from 'components/tree-select';

import type { MakePropOptional } from 'types';
import type { LocationTypesParams } from 'hooks/location-types';
import type { TreeSelectProps } from 'components/tree-select/types';

interface LocationTypeFilterProps<IsMulti extends boolean>
  extends LocationTypesParams,
    MakePropOptional<TreeSelectProps<IsMulti>, 'options'> {}

const LocationTypesFilter = <IsMulti extends boolean = true>({
  materialIds,
  supplierIds,
  businessUnitIds,
  originIds,
  scenarioId,
  options,
  ...props
}: LocationTypeFilterProps<IsMulti>) => {
  const { data } = useLocationTypes(
    {
      materialIds,
      supplierIds,
      businessUnitIds,
      originIds,
      scenarioId,
    },
    { enabled: !options },
  );

  const locationOptions: TreeSelectProps<IsMulti>['options'] = useMemo(
    () =>
      options ??
      sortBy(
        data?.map(({ label, value }) => ({
          label,
          value,
        })),
        'label',
      ),
    [data, options],
  );

  return (
    <TreeSelect
      multiple
      showSearch={false}
      options={locationOptions}
      placeholder="Location types"
      {...props}
    />
  );
};

export default LocationTypesFilter;
