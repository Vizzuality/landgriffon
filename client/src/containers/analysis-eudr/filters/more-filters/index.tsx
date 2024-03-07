import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { FilterIcon } from '@heroicons/react/solid';
import {
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { Popover, Transition } from '@headlessui/react';

import Materials from '@/containers/analysis-visualization/analysis-filters/materials/component';
import OriginRegions from '@/containers/analysis-visualization/analysis-filters/origin-regions/component';
import { recursiveMap, recursiveSort } from 'components/tree-select/utils';
import Button from 'components/button/component';
import TreeSelect from 'components/tree-select';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { eudr, setFilters } from 'store/features/eudr';
import {
  useEUDRMaterialsTree,
  useEUDRAdminRegionsTree,
  useEUDRSuppliers,
  useEUDRPlotsTree,
} from 'hooks/eudr';

import type { EUDRState } from 'store/features/eudr';
import type { Option } from 'components/forms/select';
import type { TreeSelectOption } from 'components/tree-select/types';

type MoreFiltersState = Omit<EUDRState['filters'], 'dates'>;

const INITIAL_FILTERS: MoreFiltersState = {
  materials: [],
  origins: [],
  suppliers: [],
  plots: [],
};

interface ApiTreeResponse {
  id: string;
  name: string;
  children?: this[];
}

const DEFAULT_QUERY_OPTIONS = {
  select: (data: ApiTreeResponse[]) => {
    const sorted = recursiveSort(data, 'name');
    return sorted.map((item) => recursiveMap(item, ({ id, name }) => ({ label: name, value: id })));
  },
};

const MoreFilters = () => {
  const dispatch = useAppDispatch();
  const {
    filters: { materials, origins, suppliers, plots },
  } = useAppSelector(eudr);

  const filters = useMemo(
    () => ({
      materials,
      origins,
      suppliers,
      plots,
    }),
    [materials, origins, suppliers, plots],
  );

  const [selectedFilters, setSelectedFilters] = useState(filters);
  const [counter, setCounter] = useState(0);

  // Only the changes are applied when the user clicks on Apply
  const handleApply = useCallback(() => {
    dispatch(setFilters(selectedFilters));
  }, [dispatch, selectedFilters]);

  // Restoring state from initial state only internally,
  // the user have to apply the changes
  const handleClearFilters = useCallback(() => {
    setSelectedFilters(INITIAL_FILTERS);
  }, []);

  // Updating internal state from selectors
  const handleChangeFilter = useCallback(
    <T,>(key: keyof MoreFiltersState, values: TreeSelectOption[] | Option<T>) => {
      setSelectedFilters((filters) => ({ ...filters, [key]: values }));
    },
    [],
  );

  const { refs, strategy, x, y, context } = useFloating({
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset({ mainAxis: 4 }), shift({ padding: 4 })],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  const { data: materialOptions, isLoading: materialOptionsIsLoading } = useEUDRMaterialsTree(
    undefined,
    {
      ...DEFAULT_QUERY_OPTIONS,
      select: (_materials) => {
        return recursiveSort(_materials, 'name')?.map((item) =>
          recursiveMap(item, ({ id, name, status }) => ({
            value: id,
            label: name,
            disabled: status === 'inactive',
          })),
        );
      },
      initialData: [],
    },
  );

  const { data: originOptions, isLoading: originOptionsIsLoading } = useEUDRAdminRegionsTree(
    undefined,
    DEFAULT_QUERY_OPTIONS,
  );

  const { data: supplierOptions, isLoading: supplierOptionsIsLoading } = useEUDRSuppliers(
    undefined,
    {
      ...DEFAULT_QUERY_OPTIONS,
      initialData: [],
    },
  );

  const { data: plotOptions, isLoading: plotOptionsIsLoading } = useEUDRPlotsTree(undefined, {
    ...DEFAULT_QUERY_OPTIONS,
    initialData: [],
  });

  useEffect(() => {
    const counters = Object.values(filters).map((value) => value.length);
    const total = counters.reduce((a, b) => a + b);
    setCounter(total);
  }, [filters]);

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className="flex items-center space-x-2 rounded-md border border-gray-200 bg-white px-2 py-2.5 shadow-sm hover:cursor-pointer focus:border-navy-400 focus:outline-none focus:ring-0"
            type="button"
            {...getReferenceProps({
              ref: refs.setReference,
            })}
            data-testid="more-filters-button"
          >
            <FilterIcon className="mx-1 block h-5 w-5 text-gray-900" aria-hidden="true" />
            {counter > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-400 text-xs font-semibold text-white">
                {counter}
              </span>
            )}
          </Popover.Button>
          <FloatingPortal>
            <Transition
              as="div"
              className="z-10"
              show={open}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
              {...getFloatingProps({
                ref: refs.setFloating,
                style: {
                  position: strategy,
                  top: y ?? '',
                  left: x ?? '',
                },
              })}
            >
              <Popover.Panel
                static
                className="mt-1 w-80 rounded-md bg-white p-4 shadow-md ring-1 ring-gray-200"
              >
                <div className="mb-4 flex justify-between">
                  <div>Filter by</div>
                  <button type="button" className="text-navy-400" onClick={handleClearFilters}>
                    Clear all
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="mb-1">Material</div>
                    <Materials
                      options={materialOptions}
                      multiple
                      current={selectedFilters.materials}
                      fitContent
                      loading={materialOptionsIsLoading}
                      onChange={(values) => handleChangeFilter('materials', values)}
                      id="materials-filter"
                    />
                  </div>
                  <div>
                    <div className="mb-1">Origins</div>
                    <OriginRegions
                      options={originOptions}
                      multiple
                      current={selectedFilters.origins}
                      fitContent
                      loading={originOptionsIsLoading}
                      onChange={(values) => handleChangeFilter('origins', values)}
                      id="origins-filter"
                    />
                  </div>
                  <div>
                    <div className="mb-1">Suppliers</div>
                    <TreeSelect
                      showSearch
                      multiple
                      placeholder="Suppliers"
                      options={supplierOptions}
                      current={selectedFilters.suppliers}
                      loading={supplierOptionsIsLoading}
                      onChange={(values) => handleChangeFilter('suppliers', values)}
                      id="suppliers-filter"
                    />
                  </div>
                  <div>
                    <div className="mb-1">Plots</div>
                    <TreeSelect
                      showSearch
                      multiple
                      options={plotOptions}
                      placeholder="Plots"
                      loading={plotOptionsIsLoading}
                      current={selectedFilters.plots}
                      onChange={(values) => handleChangeFilter('plots', values)}
                      id="plots-filter"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button
                    variant="secondary"
                    className="px-9"
                    onClick={() => {
                      close();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-grow"
                    onClick={() => {
                      handleApply();
                      close();
                    }}
                    data-testid="more-filters-apply-btn"
                  >
                    Apply
                  </Button>
                </div>
              </Popover.Panel>
            </Transition>
          </FloatingPortal>
        </>
      )}
    </Popover>
  );
};

export default MoreFilters;
