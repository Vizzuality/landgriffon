import type { Ref } from 'react';
import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import type { BusinessUnitsTreesParams } from 'hooks/business-units';
import { useBusinessUnitsTrees } from 'hooks/business-units';

import TreeSelect from 'components/tree-select';

import type { TreeSelectProps } from 'components/tree-select/types';

interface BusinessUnitsFilterProps
  extends Pick<
    TreeSelectProps<true>,
    'current' | 'ellipsis' | 'error' | 'fitContent' | 'multiple' | 'theme' | 'onChange'
  > {
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
    ellipsis,
    error,
    fitContent,
    multiple,
    theme = 'default',
    withSourcingLocations, // Do not a default; backend will override depth if this is set at all
    supplierIds,
    materialIds,
    originIds,
    locationTypes,
    onChange,
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
      {...props}
      multiple
      showSearch
      loading={isFetching}
      options={treeOptions}
      placeholder="all businesses"
      onChange={onChange}
      current={currentOptions}
      theme={theme}
      fitContent={fitContent}
      ellipsis={ellipsis}
      error={error}
      ref={ref}
    />
  );
};

const BusinessUnitsFilter = React.forwardRef(InnerBusinessUnitsFilter) as (
  props: BusinessUnitsFilterProps & { ref?: Ref<HTMLInputElement> },
) => React.ReactElement;

export default BusinessUnitsFilter;
