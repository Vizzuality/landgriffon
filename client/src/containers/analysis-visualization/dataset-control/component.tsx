import { useCallback, useEffect } from 'react';
import { Select } from 'antd';
import { ChevronDownIcon } from '@heroicons/react/solid';
import classNames from 'classnames';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setDataset } from 'store/features/analysis';

import type { AnalysisState } from 'store/features/analysis';

type DatasetOption = {
  id: string;
  name: string;
};

const DATASETS_OPTIONS: DatasetOption[] = [
  {
    id: 'impact',
    name: 'Impact',
  },
  {
    id: 'risk',
    name: 'Risk',
  },
  {
    id: 'material',
    name: 'Material production',
  },
];

const DatasetControl: React.FC = () => {
  const { dataset, visualizationMode } = useAppSelector(analysis);
  const dispatch = useAppDispatch();

  const handleChange = useCallback((value) => {
    dispatch(setDataset(value));
  }, []);

  useEffect(() => {
    if (visualizationMode !== 'map') {
      dispatch(setDataset(DATASETS_OPTIONS[0].id as AnalysisState['dataset']));
    }
  }, [visualizationMode]);

  return (
    <div className={classNames({ hidden: visualizationMode !== 'map' })}>
      <Select
        value={dataset}
        onChange={handleChange}
        className="w-36"
        optionLabelProp="label"
        suffixIcon={<ChevronDownIcon />}
      >
        {DATASETS_OPTIONS.map((option) => (
          <Select.Option key={option.id} value={option.id} label={option.name}>
            {option.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default DatasetControl;
