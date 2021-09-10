import { useCallback } from 'react';
import { Select } from 'antd';
import { ChevronDownIcon } from '@heroicons/react/solid';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setLayer } from 'store/features/analysis';

type LayerOption = {
  id: string;
  name: string;
};

const LAYERS_OPTIONS: LayerOption[] = [
  {
    id: 'impact',
    name: 'Impact',
  },
  {
    id: 'risk',
    name: 'Risk',
  },
  {
    id: 'crop',
    name: 'Crop production',
  },
];

const LayerControl: React.FC = () => {
  const { layer } = useAppSelector(analysis);
  const dispatch = useAppDispatch();

  const handleChange = useCallback((value) => {
    dispatch(setLayer(value));
  }, []);

  return (
    <>
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
    </>
  );
};

export default LayerControl;
