import { useMemo } from 'react';
import TreeSelect from 'components/tree-select';
import { sortBy } from 'lodash';

import { useSuppliersTrees, SuppliersTreesParams } from 'hooks/suppliers';

import type { TreeSelectProps } from 'components/tree-select/types';

type SuppliersFilterProps = {
  current: string[];
  multiple?: TreeSelectProps['multiple'];
  /** Tree depth. Defaults to `1` */
  depth?: SuppliersTreesParams['depth'];
  /** Only suppliers with sourcing locations. */
  withSourcingLocations?: SuppliersTreesParams['withSourcingLocations'];
  materialIds?: SuppliersTreesParams['materialIds'];
  businessUnitIds?: SuppliersTreesParams['businessUnitIds'];
  originIds?: SuppliersTreesParams['originIds'];
  locationTypeIds?: SuppliersTreesParams['locationTypeIds'];
  onChange?: TreeSelectProps['onChange'];
  theme?: 'default' | 'inline-primary';
  ellipsis?: TreeSelectProps['ellipsis'];
  error?: TreeSelectProps['error'];
  fitContent?: TreeSelectProps['fitContent'];
};

const SuppliersFilter: React.FC<SuppliersFilterProps> = ({
  multiple,
  current,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  materialIds,
  businessUnitIds,
  originIds,
  onChange,
  theme,
  ellipsis,
  fitContent,
  error,
  ...props
}) => {
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
      placeholder="all suppliers"
      onChange={onChange}
      current={currentOptions}
      theme={theme}
      ellipsis={ellipsis}
      error={error}
      fitContent={fitContent}
    />
  );
};

export default SuppliersFilter;
