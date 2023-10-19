import React, { useCallback, useState, useMemo, useEffect } from 'react';
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
import { useRouter } from 'next/router';
import { pickBy } from 'lodash-es';

import Materials from '../materials/component';
import OriginRegions from '../origin-regions/component';

import { flattenTree, recursiveMap, recursiveSort } from 'components/tree-select/utils';
import Select from 'components/forms/select';
import Button from 'components/button/component';
import TreeSelect from 'components/tree-select';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisFilters, setFilters } from 'store/features/analysis/filters';
import { setFilter } from 'store/features/analysis';
import { useMaterialsTrees } from 'hooks/materials';
import { useAdminRegionsTrees } from 'hooks/admin-regions';
import { useSuppliersTypes } from 'hooks/suppliers';
import { useLocationTypes } from 'hooks/location-types';

import type { Option } from 'components/forms/select';
import type { LocationTypes as LocationTyping } from 'containers/interventions/enums';
import type { TreeSelectOption } from 'components/tree-select/types';
import type { AnalysisFiltersState } from 'store/features/analysis/filters';

type MoreFiltersState = {
  materials: AnalysisFiltersState['materials'];
  origins: AnalysisFiltersState['origins'];
  t1Suppliers: AnalysisFiltersState['t1Suppliers'];
  producers: AnalysisFiltersState['producers'];
  locationTypes: AnalysisFiltersState['locationTypes'];
};

const INITIAL_FILTERS: MoreFiltersState = {
  materials: [],
  origins: [],
  t1Suppliers: [],
  producers: [],
  locationTypes: [],
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
  const { query } = useRouter();
  const { scenarioId, compareScenarioId, ...restQueries } = query;

  const dispatch = useAppDispatch();
  const { materials, origins, t1Suppliers, producers, locationTypes } =
    useAppSelector(analysisFilters);

  const moreFilters: MoreFiltersState = useMemo(
    () => ({ materials, origins, t1Suppliers, producers, locationTypes }),
    [materials, origins, t1Suppliers, producers, locationTypes],
  );

  const [selectedFilters, setSelectedFilters] = useState(moreFilters);

  const materialIds = useMemo(
    () => selectedFilters.materials.map(({ value }) => value),
    [selectedFilters.materials],
  );

  const originIds = useMemo(
    () => selectedFilters.origins.map(({ value }) => value),
    [selectedFilters.origins],
  );

  const t1SupplierIds = useMemo(
    () => selectedFilters.t1Suppliers.map(({ value }) => value),
    [selectedFilters.t1Suppliers],
  );

  const producerIds = useMemo(
    () => selectedFilters.producers.map(({ value }) => value),
    [selectedFilters.producers],
  );

  const locationTypesIds = useMemo(
    () => selectedFilters.locationTypes.map(({ value }) => value),
    [selectedFilters.locationTypes],
  );

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

  useEffect(() => {
    setSelectedFilters(moreFilters);
  }, [moreFilters]);

  const { reference, floating, strategy, x, y, context } = useFloating({
    // open: isOpen,
    // onOpenChange: handleOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset({ mainAxis: 4 }), shift({ padding: 4 })],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
  ]);

  const scenarioIds = useMemo(
    () => [scenarioId, compareScenarioId].filter((id) => id) as string[],
    [scenarioId, compareScenarioId],
  );

  const { data: materialOptions, isLoading: materialOptionsIsLoading } = useMaterialsTrees(
    {
      depth: 1,
      withSourcingLocations: true,
      scenarioIds,
      originIds,
      t1SupplierIds,
      producerIds,
      locationTypes: locationTypesIds,
    },
    {
      ...DEFAULT_QUERY_OPTIONS,
      select: (_materials) =>
        recursiveSort(_materials, 'name')?.map((item) =>
          recursiveMap(item, ({ id, name, status }) => ({
            value: id,
            label: name,
            disabled: status === 'inactive',
          })),
        ),
    },
  );

  const { data: originOptions, isLoading: originOptionsIsLoading } = useAdminRegionsTrees(
    {
      withSourcingLocations: true,
      materialIds,
      t1SupplierIds,
      producerIds,
      locationTypes: locationTypesIds,
      scenarioIds,
    },
    DEFAULT_QUERY_OPTIONS,
  );

  const { data: t1SupplierOptions, isLoading: t1SupplierOptionsIsLoading } = useSuppliersTypes(
    {
      type: 't1supplier',
      producerIds,
      materialIds,
      originIds,
      locationTypes: locationTypesIds,
      scenarioIds,
    },
    DEFAULT_QUERY_OPTIONS,
  );

  const { data: producerOptions, isLoading: producerOptionsIsLoading } = useSuppliersTypes(
    {
      type: 'producer',
      t1SupplierIds,
      materialIds,
      originIds,
      locationTypes: locationTypesIds,
      scenarioIds,
    },
    DEFAULT_QUERY_OPTIONS,
  );

  const { data: locationTypeOptions, isLoading: locationTypeOptionsIsLoading } = useLocationTypes(
    {
      materialIds,
      originIds,
      t1SupplierIds,
      producerIds,
      scenarioIds,
    },
    {
      onSuccess: (_locationTypeOptions) => {
        // * every time new location types are fetched, we need to validate if the previous location types selected are still
        // * available in the new options. Otherwise, we will remove them from the current selection.
        setSelectedFilters((filters) => ({
          ...filters,
          locationTypes: _locationTypeOptions.filter(({ value }) =>
            locationTypesIds.includes(value),
          ),
        }));
      },
    },
  );

  const reviewFilterContent = useCallback(
    (
      name: keyof MoreFiltersState,
      currentValues: TreeSelectOption[],
      allOptions: TreeSelectOption[],
    ) => {
      const allNodes = allOptions.flatMap((opt) => flattenTree(opt));
      const allKeys = allNodes.map(({ value }) => value);
      const currentNodes = currentValues.flatMap(flattenTree);
      const validOptions = currentNodes.filter(({ value }) => allKeys.includes(value));

      if (validOptions.length !== allKeys.length) {
        dispatch(setFilter({ id: name, value: validOptions }));
      }
    },
    [dispatch],
  );

  // Check current values are valid if the scenario changes
  const handleScenarioChange = useCallback(() => {
    reviewFilterContent('materials', materials, materialOptions);
    reviewFilterContent('locationTypes', locationTypes, locationTypes);
    reviewFilterContent('origins', origins, origins);
    reviewFilterContent('t1Suppliers', t1Suppliers, t1SupplierOptions);
    reviewFilterContent('producers', producers, producerOptions);
  }, [
    locationTypes,
    materialOptions,
    materials,
    origins,
    producerOptions,
    producers,
    reviewFilterContent,
    t1SupplierOptions,
    t1Suppliers,
  ]);

  useEffect(() => {
    const counters = Object.values(moreFilters).map((value) => value.length);
    const total = counters.reduce((a, b) => a + b);
    setCounter(total);
  }, [moreFilters]);

  useEffect(() => {
    handleScenarioChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  useEffect(() => {
    const options = [
      materialOptions,
      originOptions,
      t1SupplierOptions,
      producerOptions,
      locationTypeOptions,
    ];
    // Execute only when all options are loaded and there is no filters selected
    if (
      options.some((option) => !option.length) ||
      Object.values(moreFilters).some((value) => value.length)
    ) {
      return;
    }

    const { materials, origins, t1Suppliers, producers, locationTypes } = restQueries;

    const findOptions = (options: { label: string }[], filterQuery: string | string[]) =>
      options.filter((o) => {
        return (Array.isArray(filterQuery) ? filterQuery : [filterQuery]).includes(o.label);
      });

    const initialFilters = {
      materials: findOptions(materialOptions, materials),
      origins: findOptions(originOptions, origins),
      t1Suppliers: findOptions(t1SupplierOptions, t1Suppliers),
      producers: findOptions(producerOptions, producers),
      locationTypes: findOptions(locationTypeOptions, locationTypes),
    };

    const filtersToSave = pickBy(initialFilters, (value) => value.length);

    dispatch(setFilters(filtersToSave));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationTypeOptions, materialOptions, originOptions, producerOptions, t1SupplierOptions]);

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className="flex items-center space-x-2 px-2 py-2.5 border border-gray-200 rounded-md bg-white shadow-sm hover:cursor-pointer focus:border-navy-400 focus:outline-none focus:ring-0"
            type="button"
            {...getReferenceProps({
              ref: reference,
            })}
            data-testid="more-filters-button"
          >
            <FilterIcon className="block w-5 h-5 mx-1 text-gray-900" aria-hidden="true" />
            {counter > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white rounded-full bg-navy-400">
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
                ref: floating,
                style: {
                  position: strategy,
                  top: y ?? '',
                  left: x ?? '',
                },
              })}
            >
              <Popover.Panel
                static
                className="p-4 mt-1 bg-white rounded-md shadow-md w-80 ring-1 ring-gray-200"
              >
                <div className="flex justify-between mb-4">
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
                    <div className="mb-1">T1 Suppliers</div>
                    <TreeSelect
                      showSearch
                      multiple
                      placeholder="T1 Suppliers"
                      options={t1SupplierOptions}
                      current={selectedFilters.t1Suppliers}
                      loading={t1SupplierOptionsIsLoading}
                      onChange={(values) => handleChangeFilter('t1Suppliers', values)}
                      id="t1-suppliers-filter"
                    />
                  </div>
                  <div>
                    <div className="mb-1">Producers</div>
                    <TreeSelect
                      showSearch
                      multiple
                      options={producerOptions}
                      placeholder="Producers"
                      loading={producerOptionsIsLoading}
                      current={selectedFilters.producers}
                      onChange={(values) => handleChangeFilter('producers', values)}
                      id="producers-filter"
                    />
                  </div>
                  <div>
                    <div className="mb-1">Location type</div>
                    <Select<LocationTyping>
                      id="location-type-filter"
                      multiple
                      loading={locationTypeOptionsIsLoading}
                      options={locationTypeOptions}
                      placeholder="Location types"
                      onChange={(values) => handleChangeFilter('locationTypes', values)}
                      value={selectedFilters.locationTypes}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
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
