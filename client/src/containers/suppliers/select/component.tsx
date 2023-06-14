import React, { useMemo } from 'react';
import { sortBy } from 'lodash-es';

import TreeSelect from 'components/tree-select';
import { useSuppliersTypes } from 'hooks/suppliers';

import type { SupplierTypesParams } from 'hooks/suppliers';
import type { Ref } from 'react';
import type { TreeSelectOption, TreeSelectProps } from 'components/tree-select/types';

interface SuppliersFilterProps<IsMulti extends boolean>
  extends Pick<
      TreeSelectProps<IsMulti>,
      'current' | 'multiple' | 'onChange' | 'theme' | 'ellipsis' | 'error' | 'fitContent'
    >,
    Omit<SupplierTypesParams, 'sort'> {
  theme?: 'default' | 'inline-primary';
}

const InnerSuppliersFilter = <IsMulti extends boolean>(
  {
    multiple,
    current,
    materialIds,
    producerIds,
    t1SupplierIds,
    businessUnitIds,
    originIds,
    onChange,
    theme = 'default',
    ellipsis,
    fitContent,
    error,
    type,
    ...props
  }: SuppliersFilterProps<IsMulti>,
  ref: Ref<HTMLInputElement>,
) => {
  const { data, isFetching } = useSuppliersTypes({
    type,
    producerIds,
    materialIds,
    businessUnitIds,
    t1SupplierIds,
    originIds,
  });
  const treeOptions: TreeSelectProps['options'] = useMemo(
    () =>
      sortBy(
        data?.map(({ name, id }) => ({
          label: name,
          value: id,
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
      placeholder={type === 't1supplier' ? 'All t1 suppliers' : 'All producers'}
      onChange={onChange}
      current={currentOptions}
      theme={theme}
      ellipsis={ellipsis}
      error={error}
      fitContent={fitContent}
      ref={ref}
      id={`${type}-filter`}
    />
  );
};

const SuppliersFilter = React.forwardRef(InnerSuppliersFilter) as <IsMulti extends boolean>(
  props: SuppliersFilterProps<IsMulti> & {
    ref?: Ref<HTMLInputElement>;
  },
) => React.ReactElement;

export default SuppliersFilter;
