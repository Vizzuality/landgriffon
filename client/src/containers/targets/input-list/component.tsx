import { XCircleIcon } from '@heroicons/react/solid';

import { Input } from 'components/forms';

const TargetInputList: React.FC = () => (
  <div className="items-center justify-between rounded-md bg-gray-50 shadow-sm p-4">
    <div className="flex flex-row pb-2 font-semibold text-sm text-gray-500 uppercase">
      <span className="basis-1/6 mr-2.5">Year</span>
      <span className="basis-1/4 mr-2.5">Percentage</span>
      <span className="basis-1/2 mr-2.5">Value</span>
    </div>
    <div className="flex flex-row items-center space-x-4 text-gray-900">
      <Input
        type="text"
        id="year"
        name="year"
        placeholder="2018"
        className="w-full basis-1/6"
        defaultValue=""
        // onInput={handleChange}
      />
      <Input
        type="text"
        id="percentage"
        name="percentage"
        placeholder="0"
        className="w-full basis-1/4"
        defaultValue=""
        // onInput={handleChange}
      />
      <Input
        type="text"
        id="value"
        name="value"
        placeholder="0"
        className="w-full basis-1/2"
        defaultValue=""
        // onInput={handleChange}
      />
      <XCircleIcon className="w-5 h-5 mr-3 fill-gray-400" />
    </div>
  </div>
);

export default TargetInputList;
