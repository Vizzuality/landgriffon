import { XCircleIcon } from '@heroicons/react/solid';

import { Input } from 'components/forms';

import { Target } from 'types';
interface TargetListProps {
  data: Target['years'];
  onChange: (value: number) => void;
}

const TargetInputList: React.FC<TargetListProps> = ({ data, onChange }) => (
  <div className="items-center justify-between rounded-md bg-gray-50 shadow-sm p-4 max-h-56 overflow-y-scroll">
    <div className="flex flex-row pb-2 font-semibold text-sm text-gray-500 uppercase">
      <span className="basis-1/6 mr-2.5">Year</span>
      <span className="basis-1/4 mr-2.5">Percentage</span>
      <span className="basis-1/2 mr-2.5">Value</span>
    </div>
    {data.map((target) => (
      <div key={target.year} className="flex flex-row items-center space-x-4 pb-3 text-gray-900">
        <Input
          type="number"
          id="year"
          name="year"
          placeholder="2018"
          className="w-full basis-1/6"
          defaultValue={target.year}
          // onInput={handleChange}
        />
        <Input
          type="number"
          name="percentage"
          id="percentage"
          min={0}
          max={100}
          placeholder="100"
          unit="%"
          className="w-full basis-1/4"
          defaultValue={target.percentage}
          theme="inside-unit"
          onInput={(ev) => onChange(target.year, ev.target)}
        />
        <Input
          type="number"
          id="value"
          name="value"
          placeholder="0"
          className="w-full basis-1/2"
          defaultValue={target.value || 0}
          unit="tCO2e"
          theme="inside-unit"
          // onInput={handleChange}
        />
        <XCircleIcon className="w-5 h-5 mr-3 fill-gray-400" />
      </div>
    ))}
  </div>
);

export default TargetInputList;
