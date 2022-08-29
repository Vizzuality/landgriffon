import type { FC } from 'react';
import { useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { useScenario } from 'hooks/scenarios';
import { useIndicator } from 'hooks/indicators';

import { InformationCircleIcon } from '@heroicons/react/solid';
import { scenarios } from 'store/features/analysis/scenarios';
import { analysisFilters, setFilters } from 'store/features/analysis/filters';
import { setComparisonMode } from 'store/features/analysis/scenarios';
import type { ScenariosState } from 'store/features/analysis/scenarios';

import Badge from 'components/badge/component';
import Select from 'components/select';

const values = 'absolute';
const materialArticle = 'of';
const originArticle = 'in';
const supplierArticle = 'from';
const locationTypeArticle = 'aggregated by';

const DATA_VIEW_OPTIONS: { label: string; value: ScenariosState['comparisonMode'] }[] = [
  { label: 'absolute', value: 'absolute' },
  { label: 'relative', value: 'relative' },
];

type AnalysisDynamicMetadataTypes = {
  className?: string;
};

const AnalysisDynamicMetadata: FC<AnalysisDynamicMetadataTypes> = ({
  className,
}: AnalysisDynamicMetadataTypes) => {
  const dispatch = useAppDispatch();
  const { currentScenario, scenarioToCompare, comparisonMode } = useAppSelector(scenarios);
  const { data: scenario } = useScenario(currentScenario);
  const { data: scenarioB } = useScenario(scenarioToCompare);

  const scenario1 = useMemo(
    () => (currentScenario !== 'actual-data' ? scenario?.title : 'Actual data'),
    [currentScenario, scenario?.title],
  );

  const scenario2 = useMemo(
    () => (scenarioToCompare !== 'actual-data' ? scenarioB?.title : 'Actual data'),
    [scenarioToCompare, scenarioB?.title],
  );

  const { materials, origins, suppliers, locationTypes, indicator } =
    useAppSelector(analysisFilters);

  const handleRemoveBadge = useCallback(
    (id, list, option) => {
      const filteredKeys = list.filter((key) => option.label !== key.label);
      dispatch(setFilters({ [id]: filteredKeys }));
    },
    [dispatch],
  );

  const handleDataViewChange = useCallback(
    ({ value }: typeof DATA_VIEW_OPTIONS[0]) => {
      dispatch(setComparisonMode(value));
    },
    [dispatch],
  );

  const currentDataViewOption = useMemo(
    () => DATA_VIEW_OPTIONS.find(({ value }) => value === comparisonMode),
    [comparisonMode],
  );

  const {
    data: { unit },
  } = useIndicator(indicator?.value);
  const indicatorsTemplate = <span className="font-bold">{unit?.symbol}</span>;
  const compareTemplate = <span className="font-bold whitespace-nowrap">{scenario2}</span>;
  const materialTemplate = !!materials.length && (
    <ul className="inline-flex pl-1 text-xs">
      {materials.map((material) => (
        <li key={material.value} className="pr-1">
          <Badge
            key={material.value}
            data={material}
            onClick={() => handleRemoveBadge('materials', materials, material)}
            removable
          >
            {material.label}
          </Badge>
        </li>
      ))}
    </ul>
  );
  const originTemplate = !!origins.length && (
    <ul className="inline-flex pl-1">
      {origins.map((origin) => (
        <li key={origin.value}>
          <Badge
            key={origin.value}
            data={origin}
            onClick={() => handleRemoveBadge('origins', origins, origin)}
            removable
          >
            {origin.label}
          </Badge>
        </li>
      ))}
    </ul>
  );
  const supplierTemplate = !!suppliers.length && (
    <ul className="inline-flex pl-1">
      {suppliers.map((supplier) => (
        <li key={supplier.value}>
          <Badge
            key={supplier.value}
            data={supplier}
            onClick={() => handleRemoveBadge('suppliers', suppliers, supplier)}
            removable
          >
            {supplier.label}
          </Badge>
        </li>
      ))}
    </ul>
  );
  const locationTypeTemplate = !!locationTypes.length && (
    <ul className="inline-flex pl-1">
      {locationTypes.map((locationType) => (
        <li key={locationType.value}>
          <Badge
            key={locationType.value}
            data={locationType}
            onClick={() => handleRemoveBadge('locationTypes', locationTypes, locationType)}
            removable
          >
            {locationType.label}
          </Badge>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={classNames('flex items-center justify-start text-xs space-x-1', {
        [className]: !!className,
      })}
    >
      <div className="items-start">
        <InformationCircleIcon className="w-4 h-4 text-gray-900 shrink-0" />
      </div>
      {!!scenarioToCompare && (
        <div className="flex items-baseline space-x-0.5">
          <span>Viewing</span>
          <Select
            theme="inline-primary"
            current={currentDataViewOption}
            options={DATA_VIEW_OPTIONS}
            onChange={handleDataViewChange}
          />
          <span>Impact values for </span>
          <span className="font-bold">{scenario1}</span>
          <span className="font-bold">
            {!!compareTemplate && ' compared to'} {compareTemplate}
          </span>
        </div>
      )}
      {!scenarioToCompare && (
        <p className="flex-wrap items-center">
          Viewing {values} <span className="whitespace-nowrap">Impact values for</span>
          <span className="font-bold whitespace-nowrap"> {scenario1} </span>
          {indicator?.value !== 'all' && indicatorsTemplate} {!!materials.length && materialArticle}
          {materialTemplate} {!!origins.length && originArticle} {originTemplate}
          {!!suppliers.length && supplierArticle} {supplierTemplate}
          {!!locationTypes.length && locationTypeArticle} {locationTypeTemplate}
        </p>
      )}
    </div>
  );
};

export default AnalysisDynamicMetadata;
