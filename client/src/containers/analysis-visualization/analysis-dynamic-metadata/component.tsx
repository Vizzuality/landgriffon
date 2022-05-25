import { FC, useMemo, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { useScenario } from 'hooks/scenarios';

import { scenarios } from 'store/features/analysis/scenarios';
import { analysisFilters, setFilters } from 'store/features/analysis/filters';
import InfoTooltip from 'containers/info-tooltip';
import { useIndicator } from 'hooks/indicators';

import Badge from 'components/badge/component';

const values = <span className="px-0.5">absolute</span>;
const materialArticle = 'of';
const originArticle = 'in';
const supplierArticle = 'from';
const locationTypeArticle = 'aggregated by';

type AnalysisDynamicMetadataTypes = {
  className?: string;
};

const AnalysisDynamicMetadata: FC<AnalysisDynamicMetadataTypes> = ({
  className,
}: AnalysisDynamicMetadataTypes) => {
  const dispatch = useAppDispatch();
  const { currentScenario, scenarioToCompare } = useAppSelector(scenarios);
  const { data: scenario } = useScenario(currentScenario);

  const scenario1 = useMemo(
    () => (currentScenario !== 'actual-data' ? scenario?.title : 'Actual data'),
    [currentScenario, scenario?.title],
  );

  const { materials, origins, suppliers, locationTypes, indicator } =
    useAppSelector(analysisFilters);

  const handleRemoveBadget = useCallback(
    (id, list, option) => {
      const filteredKeys = list.filter((key) => option.label !== key.label);
      dispatch(setFilters({ [id]: filteredKeys }));
    },
    [dispatch],
  );

  const {
    data: { unit },
  } = useIndicator(indicator.value);
  const indicatorsTemplate = <span className="font-bold">{unit?.symbol}</span>;
  const compareTemplate = <span className="font-bold whitespace-nowrap">{scenarioToCompare}</span>;
  const materialTemplate = (
    <ul className="inline-flex">
      {materials.map((material) => (
        <li key={material.value}>
          <Badge
            key={material.value}
            data={material}
            onClick={() => handleRemoveBadget('materials', materials, material)}
            removable
          >
            {material.label}
          </Badge>
        </li>
      ))}
    </ul>
  );
  const originTemplate = (
    <ul className="inline-flex">
      {origins.map((origin) => (
        <li key={origin.value}>
          <Badge
            key={origin.value}
            data={origin}
            onClick={() => handleRemoveBadget('origins', origins, origin)}
            removable
          >
            {origin.label}
          </Badge>
        </li>
      ))}
    </ul>
  );
  const supplierTemplate = (
    <ul className="inline-flex">
      {suppliers.map((supplier) => (
        <li key={supplier.value}>
          <Badge
            key={supplier.value}
            data={supplier}
            onClick={() => handleRemoveBadget('suppliers', suppliers, supplier)}
            removable
          >
            {supplier.label}
          </Badge>
        </li>
      ))}
    </ul>
  );
  const locationTypeTemplate = (
    <ul className="inline-flex">
      {locationTypes.map((locationType) => (
        <li key={locationType.value}>
          <Badge
            key={locationType.value}
            data={locationType}
            onClick={() => handleRemoveBadget('locationTypes', locationTypes, locationType)}
            removable
          >
            {locationType.label}
          </Badge>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`flex items-center text-sm ${className}`}>
      <InfoTooltip info="metadata info" className="mr-1.5 flex mt-1.5" />
      {!!scenarioToCompare && (
        <p>
          Viewing {values} Impact values for{' '}
          <span className="font-bold whitespace-nowrap px-0.5">{scenario1}</span>${' '}
          <span className="font-bold whitespace-nowrap">
            {' '}
            {!!compareTemplate && 'compared to'} {compareTemplate}
          </span>
        </p>
      )}
      {!scenarioToCompare && (
        <p className="flex-wrap items-center">
          Viewing {values} <span className="whitespace-nowrap px-0.5">Impact values for</span>
          <span className="font-bold whitespace-nowrap px-0.5"> {scenario1} </span>
          {indicator?.value !== 'all' && indicatorsTemplate} {!!materials.length && materialArticle}{' '}
          {materialTemplate} {!!origins.length && originArticle} {originTemplate}{' '}
          {!!suppliers.length && supplierArticle} {supplierTemplate}{' '}
          {!!locationTypes.length && locationTypeArticle} {locationTypeTemplate}{' '}
        </p>
      )}
    </div>
  );
};

export default AnalysisDynamicMetadata;
