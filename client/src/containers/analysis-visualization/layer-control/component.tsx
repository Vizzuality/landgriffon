import { useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';

import Select from 'components/select';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysisUI } from 'store/features/analysis/ui';
import { analysisFilters, setLayer } from 'store/features/analysis/filters';

import type { AnalysisFiltersState } from 'store/features/analysis/filters';
import type { SelectOptions } from 'components/select/types';

const LAYERS_OPTIONS: SelectOptions = [
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

const LayerControl: React.FC = () => {
  const { visualizationMode } = useAppSelector(analysisUI);
  const { layer } = useAppSelector(analysisFilters);
  const dispatch = useAppDispatch();

  const handleChange = useCallback((selected) => dispatch(setLayer(selected.value)), [dispatch]);

  useEffect(() => {
    if (visualizationMode !== 'map') {
      // set impact when visualization mode is not map
      dispatch(setLayer(LAYERS_OPTIONS[2].value as AnalysisFiltersState['layer']));
    }
  }, [dispatch, visualizationMode]);

  const current = useMemo(() => LAYERS_OPTIONS.find(({ value }) => value === layer), [layer]);

  return (
    <div className={classNames({ hidden: visualizationMode !== 'map' })}>
      <Select current={current} onChange={handleChange} options={LAYERS_OPTIONS} />
    </div>
  );
};

export default LayerControl;
