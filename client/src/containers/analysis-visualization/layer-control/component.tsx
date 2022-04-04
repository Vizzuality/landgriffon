import { useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';

import Select from 'components/select';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import {
  analysisFilters,
  resetFiltersAndOverride,
  setLayer,
  AnalysisFiltersState,
} from 'store/features/analysis/filters';

import type { SelectOption } from 'components/select/types';

const LAYERS_OPTIONS: SelectOption[] = [
  {
    value: 'material',
    label: 'Material production',
  },
  {
    value: 'risk',
    label: 'Risk',
  },
  {
    value: 'impact',
    label: 'Impact',
  },
];

const DEFAULT_LAYER = LAYERS_OPTIONS[2];

const LayerControl: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);
  const { layer, indicator } = useAppSelector(analysisFilters);
  const dispatch = useAppDispatch();

  const current = useMemo(() => LAYERS_OPTIONS.find(({ value }) => value === layer), [layer]);

  const handleChange = useCallback(
    (selected: SelectOption) => {
      dispatch(
        resetFiltersAndOverride({
          layer: selected.value,
          indicator,
        } as Partial<AnalysisFiltersState>),
      );
      dispatch(setLayer(selected.value as AnalysisFiltersState['layer']));
    },
    [dispatch, indicator],
  );

  useEffect(() => {
    dispatch(setLayer(DEFAULT_LAYER.value as AnalysisFiltersState['layer']));
  }, [dispatch]);

  return (
    <div className={classNames({ hidden: visualizationMode !== 'map' })}>
      <Select current={current} onChange={handleChange} options={LAYERS_OPTIONS} />
    </div>
  );
};

export default LayerControl;
