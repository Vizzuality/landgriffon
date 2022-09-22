import type { Dispatch } from 'react';
import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import TreeSelect from 'components/tree-select';

// hooks
import type { LocationTypesParams } from 'hooks/location-types';
import { useLocationTypes } from 'hooks/location-types';
import type { TreeSelectOption, TreeSelectProps } from 'components/tree-select/types';

interface LocationTypeFilterProps
  extends LocationTypesParams,
    Pick<TreeSelectProps, 'theme' | 'ellipsis' | 'fitContent'> {
  current: TreeSelectOption[];
  onChange?: Dispatch<TreeSelectOption[]>;
}

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

  const options: TreeSelectProps['options'] = useMemo(
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
