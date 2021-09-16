import { useCallback } from 'react';
import { Select } from 'antd';
import { ChevronDownIcon } from '@heroicons/react/solid';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis, setDataset } from 'store/features/analysis';

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
  const { dataset } = useAppSelector(analysis);
  const dispatch = useAppDispatch();

  const handleChange = useCallback((value) => {
    dispatch(setDataset(value));
  }, []);

  return (
    <>
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
    </>
  );
};

export default DatasetControl;
