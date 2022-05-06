import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import MultipleSelect from 'components/multiple-select';

// hooks
import { useLocationTypes } from 'hooks/interventions';

// types
import type { MultipleSelectProps } from 'components/multiple-select/types';

type LocationTypeFilterProps = {
  current: MultipleSelectProps['current'];
  multiple?: MultipleSelectProps['multiple'];
  onChange?: MultipleSelectProps['onChange'];
  theme?: 'default' | 'inline-primary';
  optionsLocationTypes?: MultipleSelectProps['current'];
  ellipsis?: MultipleSelectProps['ellipsis'];
  fitContent?: MultipleSelectProps['fitContent'];
};

const LocationTypesFilter: React.FC<LocationTypeFilterProps> = ({
  multiple,
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
          label: d[0].toUpperCase() + d.substring(1),
          value: d,
        })),
        'label',
      ),
    [data],
  );

  return (
    <MultipleSelect
      multiple={multiple}
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
