import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import { useBusinessUnitsTrees } from 'hooks/business-units';
import TreeSelect from 'components/tree-select';

import type { BusinessUnitsTreesParams } from 'hooks/business-units';
import type { Ref } from 'react';
import type { TreeSelectProps } from 'components/tree-select/types';

interface BusinessUnitsFilterProps extends Omit<TreeSelectProps<true>, 'options'> {
  /** Tree depth. Defaults to `1` */
  depth?: BusinessUnitsTreesParams['depth'];
  ellipsis?: TreeSelectProps['ellipsis'];
  /** Only materials with sourcing locations. */
  withSourcingLocations?: BusinessUnitsTreesParams['withSourcingLocations'];
  materialIds?: BusinessUnitsTreesParams['materialIds'];
  supplierIds?: BusinessUnitsTreesParams['supplierIds'];
  originIds?: BusinessUnitsTreesParams['originIds'];
  locationTypes?: BusinessUnitsTreesParams['locationTypes'];
}

const InnerBusinessUnitsFilter = (
  {
    current,
    depth = 1,
    multiple,
    withSourcingLocations, // Do not a default; backend will override depth if this is set at all
    supplierIds,
    materialIds,
    originIds,
    locationTypes,
    ...props
  }: BusinessUnitsFilterProps,
  ref: Ref<HTMLInputElement>,
) => {
  const { data, isFetching } = useBusinessUnitsTrees({
    depth,
    withSourcingLocations,
    supplierIds,
    materialIds,
    originIds,
    locationTypes,
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

  const currentOptions = useMemo<TreeSelectProps<true>['options']>(() => {
    const checkedOptions = [];
    const currentIds = Array.isArray(current) ? current : [current];
    currentIds?.forEach((key) => {
      const recursiveSearch = (arr: TreeSelectProps<true>['options']) => {
        arr.forEach((opt) => {
          if (opt.value === key?.value) checkedOptions.push(opt);
          if (opt.children) recursiveSearch(opt.children);
        });
      };
      recursiveSearch(treeOptions);
    });
    return checkedOptions;
  }, [current, treeOptions]);

  return (
    <TreeSelect
      multiple
      showSearch
      loading={isFetching}
      options={treeOptions}
      placeholder="all businesses"
      current={currentOptions}
      ref={ref}
      {...props}
    />
  );
};

const BusinessUnitsFilter = React.forwardRef(InnerBusinessUnitsFilter) as (
  props: BusinessUnitsFilterProps & { ref?: Ref<HTMLInputElement> },
) => React.ReactElement;

export default BusinessUnitsFilter;
