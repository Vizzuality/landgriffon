import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import TreeSelect from 'components/tree-select';
import { useAdminRegionsTrees } from 'hooks/admin-regions';

import type { Ref, ComponentRef } from 'react';
import type { AdminRegionsTreesParams } from 'hooks/admin-regions';
import type { TreeSelectOption, TreeSelectProps } from 'components/tree-select/types';

interface OriginRegionsFilterProps<IsMulti extends boolean>
  extends Omit<TreeSelectProps<IsMulti>, 'options'> {
  /** Tree depth. Defaults to `1` */
  depth?: AdminRegionsTreesParams['depth'];
  /** Only regions with sourcing locations. */
  withSourcingLocations?: AdminRegionsTreesParams['withSourcingLocations'];
  businessUnitIds?: AdminRegionsTreesParams['businessUnitIds'];
  supplierIds?: AdminRegionsTreesParams['supplierIds'];
  materialIds?: AdminRegionsTreesParams['materialIds'];
  theme?: 'default' | 'inline-primary';
}

const InnerOriginRegionsFilter = <IsMulti extends boolean>(
  {
    multiple,
    current,
    depth = 1,
    withSourcingLocations, // Do not a default; backend will override depth if this is set at all
    materialIds,
    supplierIds,
    businessUnitIds,
    onChange,
    theme = 'default',
    ellipsis,
    error,
    fitContent,
    ...props
  }: OriginRegionsFilterProps<IsMulti>,
  ref: Ref<ComponentRef<typeof TreeSelect>>,
) => {
  const { data, isFetching } = useAdminRegionsTrees({
    depth,
    withSourcingLocations,
    materialIds,
    supplierIds,
    businessUnitIds,
  });

  const treeOptions: TreeSelectProps<IsMulti>['options'] = useMemo(
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

  const currentOptions = useMemo<TreeSelectProps<IsMulti>['current']>(() => {
    if (!multiple) return current;
    const checkedOptions: TreeSelectOption[] = [];

    (current as TreeSelectOption[])?.forEach((key) => {
      const recursiveSearch = (arr: TreeSelectOption[]) => {
        arr.forEach((opt) => {
          if (opt.value === key.value) checkedOptions.push(opt);
          if (opt.children) recursiveSearch(opt.children);
        });
      };
      recursiveSearch(treeOptions);
    });
    return checkedOptions as TreeSelectProps<IsMulti>['current'];
  }, [current, multiple, treeOptions]);

  return (
    <TreeSelect
      {...props}
      multiple={multiple}
      showSearch
      current={currentOptions}
      loading={isFetching}
      options={treeOptions}
      placeholder="all sourcing regions"
      onChange={onChange}
      theme={theme}
      ellipsis={ellipsis}
      error={error}
      fitContent={fitContent}
      ref={ref}
    />
  );
};

const OriginRegionsFilter = React.forwardRef(InnerOriginRegionsFilter) as <IsMulti extends boolean>(
  props: OriginRegionsFilterProps<IsMulti> & { ref?: Ref<ComponentRef<typeof TreeSelect>> },
) => JSX.Element;

export default OriginRegionsFilter;
