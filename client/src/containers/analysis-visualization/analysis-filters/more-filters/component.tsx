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
import { useBusinessUnitsOptionsTrees } from 'hooks/business-units';

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
  businessUnits: AnalysisFiltersState['businessUnits'];
};

const INITIAL_FILTERS: MoreFiltersState = {
  materials: [],
  origins: [],
  t1Suppliers: [],
  producers: [],
  locationTypes: [],
  businessUnits: [],
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
  const { scenarioId, compareScenarioId } = query;

  const dispatch = useAppDispatch();
  const { materials, origins, t1Suppliers, producers, locationTypes, businessUnits } =
    useAppSelector(analysisFilters);

  const moreFilters: MoreFiltersState = useMemo(
    () => ({ materials, origins, t1Suppliers, producers, locationTypes, businessUnits }),
    [materials, origins, t1Suppliers, producers, locationTypes, businessUnits],
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

  const businessUnitIds = useMemo(
    () => selectedFilters.businessUnits.map(({ value }) => value),
    [selectedFilters.businessUnits],
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

  const { refs, strategy, x, y, context } = useFloating({
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
      businessUnitIds,
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
      businessUnitIds,
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
      businessUnitIds,
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
      businessUnitIds,
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
      businessUnitIds,
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

  const { data: businessUnitsOptions, isLoading: businessUnitsOptionsIsLoading } =
    useBusinessUnitsOptionsTrees({
      depth: 1,
      withSourcingLocations: true,
      materialIds,
      originIds,
      t1SupplierIds,
      producerIds,
      locationTypes: locationTypesIds,
      scenarioIds,
    });

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
    reviewFilterContent('businessUnits', businessUnits, businessUnitsOptions);
  }, [
    businessUnits,
    businessUnitsOptions,
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
                    <div className="mb-1">Business units</div>
                    <TreeSelect
                      showSearch
                      current={selectedFilters.businessUnits}
                      loading={businessUnitsOptionsIsLoading}
                      options={businessUnitsOptions}
                      placeholder="Business Units"
                      multiple
                      fitContent
                      onChange={(values) => handleChangeFilter('businessUnits', values)}
                      id="business-units-filter"
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
