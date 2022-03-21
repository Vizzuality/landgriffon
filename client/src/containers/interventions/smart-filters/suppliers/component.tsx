import { useMemo } from 'react';
import TreeSelect from 'components/tree-select';
import { sortBy } from 'lodash';

import { useSuppliersTrees, SuppliersTreesParams } from 'hooks/suppliers';

import type { TreeSelectProps } from 'components/tree-select/types';

// form validation
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schemaValidation = yup.object({
  suppliers: yup.array().of(yup.string()).min(1).required(),
});

type SuppliersFilterProps = {
  current: TreeSelectProps['current'];
  multiple?: TreeSelectProps['multiple'];
  /** Tree depth. Defaults to `1` */
  depth?: SuppliersTreesParams['depth'];
  /** Only suppliers with sourcing locations. */
  withSourcingLocations?: SuppliersTreesParams['withSourcingLocations'];
  onChange?: TreeSelectProps['onChange'];
  theme?: 'default' | 'inline-primary';
  ellipsis?: TreeSelectProps['ellipsis'];
  fitContent?: TreeSelectProps['fitContent'];
};

const SuppliersFilter: React.FC<SuppliersFilterProps> = ({
  multiple,
  current,
  depth = 1,
  withSourcingLocations, // Do not a default; backend will override depth if this is set at all
  onChange,
  theme,
  ellipsis,
  fitContent,
}) => {
  const { data, isFetching } = useSuppliersTrees({ depth, withSourcingLocations });

  const treeOptions: TreeSelectProps['options'] = useMemo(
    () =>
      sortBy(
        data?.map(({ name, id, children }) => ({
          label: name,
          value: id,
          children: children?.map(({ name, id }) => ({ label: name, value: id })),
        })),
        'label',
      ),
    [data],
  );

  const {
    register,
    control,
    getValues,
    formState: { isValid, errors },
  } = useForm({
    resolver: yupResolver(schemaValidation),
  });

  return (
    <TreeSelect
      {...register('suppliers')}
      multiple={multiple}
      showSearch
      loading={isFetching}
      options={treeOptions}
      placeholder="Suppliers"
      onChange={onChange}
      current={current}
      theme={theme}
      ellipsis={ellipsis}
      fitContent={fitContent}
    />
  );
};

export default SuppliersFilter;
