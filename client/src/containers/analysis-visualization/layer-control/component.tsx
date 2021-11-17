import { useCallback, useEffect } from 'react';
import { Select } from 'antd';
import { ChevronDownIcon } from '@heroicons/react/solid';
import classNames from 'classnames';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setLayer } from 'store/features/analysis';

import type { AnalysisState } from 'store/features/analysis';

type LayerOption = {
  id: string;
  name: string;
};

const LAYERS_OPTIONS: LayerOption[] = [
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

const LayerControl: React.FC = () => {
  const { layer, visualizationMode } = useAppSelector(analysis);
  const dispatch = useAppDispatch();

  const handleChange = useCallback(
    (value) => {
      dispatch(setLayer(value));
    },
    [dispatch],
  );

  useEffect(() => {
    if (visualizationMode !== 'map') {
      // set impact when visualization mode is not map
      dispatch(setLayer(LAYERS_OPTIONS[2].id as AnalysisState['layer']));
    }
  }, [dispatch, visualizationMode]);

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
