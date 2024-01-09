import { useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { InformationCircleIcon } from '@heroicons/react/outline';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { useScenario } from 'hooks/scenarios';
import { useIndicator } from 'hooks/indicators';
import { scenarios } from 'store/features/analysis/scenarios';
import { analysisFilters, setFilters } from 'store/features/analysis/filters';
import Badge from 'components/badge/component';
import { ComparisonToggle } from 'components/legend/item/comparisonModeToggle';

import type { Option } from 'components/forms/select';
import type { FC } from 'react';

const values = 'absolute';
const materialArticle = 'of';
const originArticle = 'in';
const supplierArticle = 'from';
const producerArticle = 'and from';
const locationTypeArticle = 'aggregated by';

type AnalysisDynamicMetadataTypes = {
  className?: string;
};

const AnalysisDynamicMetadata: FC<AnalysisDynamicMetadataTypes> = ({
  className,
}: AnalysisDynamicMetadataTypes) => {
  const dispatch = useAppDispatch();
  const { currentScenario, scenarioToCompare, isComparisonEnabled } = useAppSelector(scenarios);
  const { data: scenario } = useScenario(currentScenario);
  const { data: scenarioB } = useScenario(scenarioToCompare);

  const scenario1 = useMemo(
    () => (currentScenario ? scenario?.title : 'Actual data'),
    [currentScenario, scenario?.title],
  );

  const scenario2 = useMemo(
    () => (scenarioToCompare ? scenarioB?.title : 'Actual data'),
    [scenarioToCompare, scenarioB?.title],
  );

  const { materials, origins, t1Suppliers, producers, locationTypes, indicator } =
    useAppSelector(analysisFilters);

  const handleRemoveBadge = useCallback(
    (id: string, list: Option[], option: Option) => {
      const filteredKeys = list.filter((key) => option.label !== key.label);
      dispatch(setFilters({ [id]: filteredKeys }));
    },
    [dispatch],
  );

  const { data: unit } = useIndicator(indicator?.value, { select: (data) => data?.unit });

  const indicatorsTemplate = useMemo(
    () => indicator?.value !== 'all' && <span className="font-bold">({unit?.symbol})</span>,
    [indicator?.value, unit?.symbol],
  );

  const comparisonTemplate = useMemo(
    () =>
      !!isComparisonEnabled && (
        <span>
          compared to <span className="whitespace-nowrap font-bold">{scenario2}</span>
        </span>
      ),
    [isComparisonEnabled, scenario2],
  );

  const materialTemplate = useMemo(
    () =>
      !!materials.length && (
        <span>
          {materialArticle}{' '}
          <ul className="inline-flex gap-1 text-xs">
            {materials.map((material) => (
              <li key={material.value}>
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
        </span>
      ),
    [handleRemoveBadge, materials],
  );
  const originTemplate = useMemo(
    () =>
      !!origins.length && (
        <span>
          {originArticle}{' '}
          <ul className="inline-flex gap-1">
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
        </span>
      ),
    [handleRemoveBadge, origins],
  );
  const supplierTemplate = useMemo(
    () =>
      !!t1Suppliers.length && (
        <span>
          {supplierArticle}{' '}
          <ul className="inline-flex gap-1">
            {t1Suppliers.map((supplier) => (
              <li key={supplier.value}>
                <Badge
                  key={supplier.value}
                  data={supplier}
                  onClick={() => handleRemoveBadge('t1Suppliers', t1Suppliers, supplier)}
                  removable
                >
                  {supplier.label}
                </Badge>
              </li>
            ))}
          </ul>
        </span>
      ),
    [handleRemoveBadge, t1Suppliers],
  );
  const producerTemplate = useMemo(
    () =>
      !!producers.length && (
        <span>
          {producerArticle}{' '}
          <ul className="inline-flex gap-1">
            {producers.map((producer) => (
              <li key={producer.value}>
                <Badge
                  key={producer.value}
                  data={producer}
                  onClick={() => handleRemoveBadge('producers', producers, producer)}
                  removable
                >
                  {producer.label}
                </Badge>
              </li>
            ))}
          </ul>
        </span>
      ),
    [handleRemoveBadge, producers],
  );
  const locationTypeTemplate = useMemo(
    () =>
      !!locationTypes.length && (
        <span>
          {locationTypeArticle}{' '}
          <ul className="inline-flex gap-1">
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
        </span>
      ),
    [handleRemoveBadge, locationTypes],
  );

  return (
    <div
      className={classNames('flex flex-wrap items-center justify-start gap-1 text-xs', className)}
      data-testid="analysis-dynamic-metadata"
    >
      <InformationCircleIcon className="h-4 w-4 shrink-0 text-gray-900" />
      Viewing {isComparisonEnabled ? <ComparisonToggle /> : values}
      <span>
        <span className="whitespace-nowrap">Impact values for</span>
        <span className="whitespace-nowrap font-bold"> {scenario1} </span>
      </span>
      {comparisonTemplate}
      {indicatorsTemplate}
      {materialTemplate}
      {originTemplate}
      {supplierTemplate}
      {producerTemplate}
      {locationTypeTemplate}
    </div>
  );
};

export default AnalysisDynamicMetadata;
