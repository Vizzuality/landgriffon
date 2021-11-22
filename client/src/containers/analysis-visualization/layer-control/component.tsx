import { useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';

import Select from 'components/select';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setLayer } from 'store/features/analysis';

import type { AnalysisState } from 'store/features/analysis';
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
  const { layer, visualizationMode } = useAppSelector(analysis);
  const dispatch = useAppDispatch();

  const handleChange = useCallback((selected) => dispatch(setLayer(selected.value)), [dispatch]);

  useEffect(() => {
    if (visualizationMode !== 'map') {
      // set impact when visualization mode is not map
      dispatch(setLayer(LAYERS_OPTIONS[2].value as AnalysisState['layer']));
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
