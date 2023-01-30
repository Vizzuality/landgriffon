import { XCircleIcon } from '@heroicons/react/solid';

import { Input } from 'components/forms';

import type { TargetYear } from 'types';
interface TargetListProps {
  data: TargetYear[];
  onChange?: (year: number, target: Record<string, unknown>) => void;
}

const TargetInputList: React.FC<TargetListProps> = ({ data }) => (
  <div className="items-center justify-between p-4 overflow-y-scroll rounded-md shadow-sm bg-gray-50 max-h-56">
    <div className="flex flex-row pb-2 text-sm font-semibold text-gray-500 uppercase">
      <span className="basis-1/6 mr-2.5">Year</span>
      <span className="basis-1/4 mr-2.5">Percentage</span>
      <span className="basis-1/2 mr-2.5">Value</span>
    </div>
    {data.map((target) => (
      <div key={target.year} className="flex flex-row items-center pb-3 space-x-4 text-gray-900">
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
          // onInput={(ev) => onChange(target.year, ev.target)}
        />
        <Input
          type="number"
          id="value"
          name="value"
          placeholder="0"
          className="w-full basis-1/2"
          defaultValue={target.value || 0}
          unit="tCO2e"
          // onInput={handleChange}
        />
        <XCircleIcon className="w-5 h-5 mr-3 fill-gray-400" />
      </div>
    ))}
  </div>
);

export default TargetInputList;
