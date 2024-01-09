import { XCircleIcon } from '@heroicons/react/solid';

import { Input } from 'components/forms';

import type { TargetYear } from 'types';
interface TargetListProps {
  data: TargetYear[];
  onChange?: (year: number, target: Record<string, unknown>) => void;
}

const TargetInputList: React.FC<TargetListProps> = ({ data }) => (
  <div className="max-h-56 items-center justify-between overflow-y-scroll rounded-md bg-gray-50 p-4 shadow-sm">
    <div className="flex flex-row pb-2 text-sm font-semibold uppercase text-gray-500">
      <span className="mr-2.5 basis-1/6">Year</span>
      <span className="mr-2.5 basis-1/4">Percentage</span>
      <span className="mr-2.5 basis-1/2">Value</span>
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
        <XCircleIcon className="mr-3 h-5 w-5 fill-gray-400" />
      </div>
    ))}
  </div>
);

export default TargetInputList;
