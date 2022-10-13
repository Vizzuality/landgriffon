import React, { useMemo } from 'react';
import { sortBy } from 'lodash';

import TreeSelect from 'components/tree-select';
import { useSuppliersTrees } from 'hooks/suppliers';

import type { SuppliersTreesParams } from 'hooks/suppliers';
import type { Ref } from 'react';
import type { TreeSelectOption, TreeSelectProps } from 'components/tree-select/types';

interface SuppliersFilterProps<IsMulti extends boolean>
  extends Pick<
    TreeSelectProps<IsMulti>,
    'current' | 'multiple' | 'onChange' | 'theme' | 'ellipsis' | 'error' | 'fitContent'
  > {
  /** Tree depth. Defaults to `1` */
  depth?: SuppliersTreesParams['depth'];
  /** Only suppliers with sourcing locations. */
  withSourcingLocations?: SuppliersTreesParams['withSourcingLocations'];
  materialIds?: SuppliersTreesParams['materialIds'];
  businessUnitIds?: SuppliersTreesParams['businessUnitIds'];
  originIds?: SuppliersTreesParams['originIds'];
  locationTypes?: SuppliersTreesParams['locationTypes'];
  theme?: 'default' | 'inline-primary';
}

const InnerSuppliersFilter = <IsMulti extends boolean>(
  {
    multiple,
    current,
    depth = 1,
    withSourcingLocations, // Do not a default; backend will override depth if this is set at all
    materialIds,
    businessUnitIds,
    originIds,
    onChange,
    theme = 'default',
    ellipsis,
    fitContent,
    error,
    ...props
  }: SuppliersFilterProps<IsMulti>,
  ref: Ref<HTMLInputElement>,
) => {
  const { data, isFetching } = useSuppliersTrees({
    depth,
    withSourcingLocations,
    materialIds,
    businessUnitIds,
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
      loading={isFetching}
      options={treeOptions}
      placeholder="all suppliers"
      onChange={onChange}
      current={currentOptions}
      theme={theme}
      ellipsis={ellipsis}
      error={error}
      fitContent={fitContent}
      ref={ref}
    />
  );
};

const SuppliersFilter = React.forwardRef(InnerSuppliersFilter) as <IsMulti extends boolean>(
  props: SuppliersFilterProps<IsMulti> & {
    ref?: Ref<HTMLInputElement>;
  },
) => React.ReactElement;

export default SuppliersFilter;
