import React, { forwardRef, useMemo } from 'react';
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
  locationTypes?: BusinessUnitsTreesParams['locationTypes'];
  onChange?: TreeSelectProps['onChange'];
};

const BusinessUnitsFilter = forwardRef<HTMLInputElement, BusinessUnitsFilterProps>(
  (
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
    },
    ref,
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
  },
);

BusinessUnitsFilter.displayName = 'BusinessUnitsFilter';

export default BusinessUnitsFilter;
