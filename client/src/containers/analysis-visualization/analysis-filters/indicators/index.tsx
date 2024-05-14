import { useCallback, useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import queryString from 'query-string';
import { usePathname } from 'next/navigation';
import { xor } from 'lodash-es';

import { useIndicators } from 'hooks/indicators';
import TreeSelect from '@/components/tree-select';
import { TreeSelectOption } from '@/components/tree-select/types';
import { flattenTree } from '@/components/tree-select/utils';
import { useSyncIndicators } from '@/store/hooks';

type HasParentProperty<T> = T & { isParent?: boolean };

const IndicatorsFilter = () => {
  const { query = {}, replace } = useRouter();
  const isTableView = usePathname().includes('/table');
  const [selectedOptions, setSelectedOptions] = useState<TreeSelectOption[] | undefined>(undefined);
  const [syncedIndicators, syncIndicators] = useSyncIndicators();

  const { data, isFetching } = useIndicators(
    { sort: 'category' },
    {
      select: (data) => data?.data,
    },
  );

  const options = useMemo<TreeSelectOption[]>(() => {
    const categories = Array.from(new Set(data?.map(({ category }) => category).filter(Boolean)));

    const categoryGroups = categories.map((category) => {
      const indicators = data?.filter((indicator) => indicator.category === category);
      const categoryOptions = indicators.map(
        (indicator) =>
          ({
            label: indicator.metadata?.short_name,
            value: indicator.id,
          }) satisfies TreeSelectOption<(typeof indicator)['id']>,
      );
      return {
        label: category,
        value: category,
        isParent: true,
        children: categoryOptions,
      } satisfies HasParentProperty<TreeSelectOption<typeof category>>;
    });

    return categoryGroups;
  }, [data]);

  const allNodes = useMemo(() => options?.flatMap((opt) => flattenTree(opt)), [options]);

  const handleChange = useCallback(
    (options: HasParentProperty<TreeSelectOption>[]) => {
      const _v = options
        .map(({ value, isParent }) => {
          if (isParent) {
            return allNodes
              .filter(({ value: v }) => v === value)
              .map(({ children }) => children.map(({ value }) => value))
              .flat(1);
          }
          return value;
        })
        .flat(1);

      const { indicators, detail, ...restQuery } = query;

      setSelectedOptions(options);

      const optionDetailRemoved = xor(selectedOptions, options).some(
        ({ value }) => value === detail,
      );

      syncIndicators(_v.length ? _v : null);

      replace(
        {
          query: queryString.stringify({
            ...restQuery,
            ...(isTableView && optionDetailRemoved && { detail: undefined }),
          }),
        },
        undefined,
        {
          shallow: true,
        },
      );
    },
    [query, replace, allNodes, selectedOptions, isTableView, syncIndicators],
  );

  const initialSelectedOptions = useMemo(() => {
    if (syncedIndicators && options?.length) {
      const selectedOptions = allNodes.filter(({ value }) => syncedIndicators.includes(value));
      return selectedOptions;
    }
    return undefined;
  }, [syncedIndicators, options, allNodes]);

  useEffect(() => {
    setSelectedOptions(initialSelectedOptions);
  }, [initialSelectedOptions]);

  return (
    <div className="h-full w-[325px]">
      <TreeSelect
        id="indicators"
        multiple
        showSearch
        loading={isFetching}
        options={options}
        onChange={handleChange}
        current={selectedOptions}
        placeholder="All indicators"
        maxBadges={0}
        selectedBadgeLabel={`indicator${selectedOptions?.length > 1 ? 's' : ''} selected`}
      />
    </div>
  );
};

export default IndicatorsFilter;
