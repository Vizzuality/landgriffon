import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import TreeSelect from 'components/tree-select';

// hooks
import { useLocationTypes } from 'hooks/interventions';
import type { TreeSelectProps } from 'components/tree-select/types';

type LocationTypeFilterProps = {
  current: TreeSelectProps['current'];
  onChange?: TreeSelectProps['onChange'];
  theme?: TreeSelectProps['theme'];
  optionsLocationTypes?: TreeSelectProps['current'];
  ellipsis?: TreeSelectProps['ellipsis'];
  fitContent?: TreeSelectProps['fitContent'];
};

const LocationTypesFilter: React.FC<LocationTypeFilterProps> = ({
  current,
  onChange,
  theme,
  ellipsis,
  fitContent,
}) => {
  const data = useLocationTypes();

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
