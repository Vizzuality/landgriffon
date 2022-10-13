import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

// hooks
import { useLocationTypes } from 'hooks/location-types';
import TreeSelect from 'components/tree-select';

import type { LocationTypesParams } from 'hooks/location-types';
import type { TreeSelectProps } from 'components/tree-select/types';

interface LocationTypeFilterProps
  extends LocationTypesParams,
    Pick<TreeSelectProps<true>, 'current' | 'onChange' | 'theme' | 'ellipsis' | 'fitContent'> {}

const LocationTypesFilter: React.FC<LocationTypeFilterProps> = ({
  current,
  onChange,
  theme,
  ellipsis,
  fitContent,
  materialIds,
  supplierIds,
  businessUnitIds,
  originIds,
  scenarioId,
}) => {
  const { data } = useLocationTypes({
    materialIds,
    supplierIds,
    businessUnitIds,
    originIds,
    scenarioId,
  });

  const options: TreeSelectProps<true>['options'] = useMemo(
    () =>
      sortBy(
        data?.map(({ label, value }) => ({
          label,
          value,
        })),
        'label',
      ),
    [data],
  );

  return (
    <TreeSelect
      multiple
      showSearch={false}
      options={options}
      placeholder="Location types"
      onChange={onChange}
      current={current}
      theme={theme}
      fitContent={fitContent}
      ellipsis={ellipsis}
    />
  );
};

export default LocationTypesFilter;
