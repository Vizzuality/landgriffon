import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import MultipleSelect from 'components/multiple-select';

// hooks
import { useLocationTypes } from 'hooks/interventions';

// types
import type { MultipleSelectProps } from 'components/multiple-select/types';

type LocationTypeFilterProps = {
  current: MultipleSelectProps['current'];
  onChange?: MultipleSelectProps['onChange'];
  theme?: 'default' | 'inline-primary';
  optionsLocationTypes?: MultipleSelectProps['current'];
  ellipsis?: MultipleSelectProps['ellipsis'];
  fitContent?: MultipleSelectProps['fitContent'];
};

const LocationTypesFilter: React.FC<LocationTypeFilterProps> = ({
  current,
  onChange,
  theme,
  ellipsis,
  fitContent,
}) => {
  const data = useLocationTypes();

  const options: MultipleSelectProps['options'] = useMemo(
    () =>
      sortBy(
        data?.map((d) => ({
          label: d,
          value: d,
        })),
        'label',
      ),
    [data],
  );

  return (
    <MultipleSelect
      showSearch
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
