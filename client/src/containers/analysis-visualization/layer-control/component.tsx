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
    id: 'material',
    name: 'Material production',
  },
  {
    id: 'risk',
    name: 'Risk',
  },
  {
    id: 'impact',
    name: 'Impact',
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
      <Select
        value={layer}
        onChange={handleChange}
        className="w-36"
        optionLabelProp="label"
        suffixIcon={<ChevronDownIcon />}
      >
        {LAYERS_OPTIONS.map((option) => (
          <Select.Option key={option.id} value={option.id} label={option.name}>
            {option.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default LayerControl;
