import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import { useBusinessUnitsTrees, BusinessUnitsTreesParams } from 'hooks/business-units';

import TreeSelect from 'components/tree-select';

import type { TreeSelectProps } from 'components/tree-select/types';

type BusinessUnitsFilterProps = {
  current: string[];
  /** Tree depth. Defaults to `1` */
  currentOptions?: TreeSelectProps['current'];
  depth?: BusinessUnitsTreesParams['depth'];
  ellipsis?: TreeSelectProps['ellipsis'];
  error?: TreeSelectProps['error'];
  fitContent?: TreeSelectProps['fitContent'];
  multiple?: TreeSelectProps['multiple'];
  theme?: 'default' | 'inline-primary';
  /** Only materials with sourcing locations. */
  withSourcingLocations?: BusinessUnitsTreesParams['withSourcingLocations'];
  materialIds?: BusinessUnitsTreesParams['materialIds'];
  supplierIds?: BusinessUnitsTreesParams['supplierIds'];
  originIds?: BusinessUnitsTreesParams['originIds'];
  onChange?: TreeSelectProps['onChange'];
};

const BusinessUnitsFilter: React.FC<BusinessUnitsFilterProps> = ({
  current,
  depth = 1,
  ellipsis,
  error,
  fitContent,
  multiple,
  theme = 'inline-primary',
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  supplierIds,
  materialIds,
  originIds,
  onChange,
  ...props
}) => {
  const { data, isFetching } = useBusinessUnitsTrees({
    depth,
    withSourcingLocations,
    supplierIds,
    materialIds,
    originIds,
  });

  const treeOptions: TreeSelectProps['options'] = useMemo(
    () =>
      sortBy(
        data?.map(({ name, id, children }) => ({
          label: name,
          value: id,
          children: children?.map(({ name, id, children }) => ({
            label: name,
            value: id,
            children: children?.map(({ name, id }) => ({ label: name, value: id })),
          })),
        })),
        'label',
      ),
    [data],
  );

  const currentOptions = useMemo(() => {
    const checkedOptions = [];
    current?.forEach((key) => {
      const recursiveSearch = (arr) => {
        arr.forEach((opt) => {
          if (opt.value === key) checkedOptions.push(opt);
          if (opt.children) recursiveSearch(opt.children);
        });
      };
      recursiveSearch(treeOptions);
    });
    return checkedOptions;
  }, [current, treeOptions]);

  return (
    <TreeSelect
      {...props}
      multiple={multiple}
      showSearch
      loading={isFetching}
      options={treeOptions}
      placeholder="all business"
      onChange={onChange}
      current={currentOptions}
      theme={theme}
      fitContent={fitContent}
      ellipsis={ellipsis}
      error={error}
    />
  );
};

export default BusinessUnitsFilter;
