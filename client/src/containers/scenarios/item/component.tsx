import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { RadioGroup, Switch } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import type { Scenario } from '../types';
import ScenariosComparison from '../comparison';

type ScenariosItemProps = {
  data: Scenario;
  isComparisonAvailable: boolean;
  isSelected: boolean;
};

const ScenariosList: React.FC<ScenariosItemProps> = (props: ScenariosItemProps) => {
  const { data, isSelected, isComparisonAvailable } = props;
  const [isComparisonEnabled, setComparisonEnabled] = useState(false);

  useEffect(() => {
    // Disabling comparison when is not selected
    if (!isSelected) {
      setComparisonEnabled(false);
    }
  }, [isSelected]);

  return (
    <li className="col-span-1 rounded-md">
      <div
        className={classNames('flex items-center border border-gray-200 bg-white rounded', {
          'border-green-700 bg-green-50': isSelected,
          'rounded-b-none': isComparisonAvailable,
        })}
      >
        <RadioGroup.Option
          key={data.title}
          value={data}
          className="flex-1 flex items-top justify-between truncate"
        >
          {({ checked }) => (
            <>
              <div className="py-4 flex-shrink-0 flex items-top justify-center w-10">
                <span
                  className={classNames(
                    checked ? 'bg-green-700 border-transparent' : 'bg-white border-gray-200',
                    'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center'
                  )}
                  aria-hidden="true"
                >
                  <span className="rounded-full bg-white w-1.5 h-1.5" />
                </span>
              </div>
              <div className="flex-1 pr-4 py-4  truncate">
                <h2 className="text-gray-900 text-sm font-medium">{data.title}</h2>
                <p className="text-gray-600 text-sm">
                  {data.id === 'actual-data' && (
                    <span className="text-green-700">Based on your uploaded data</span>
                  )}
                  {data.id !== 'actual-data' &&
                    data.updatedAt &&
                    `Last edited ${format(new Date(data.updatedAt), 'yyyy/MM/dd')}`}
                </p>
              </div>
            </>
          )}
        </RadioGroup.Option>
        {data.id !== 'actual-data' && (
          <div className="flex-shrink-0 pr-2">
            <button
              type="button"
              className="w-8 h-8 inline-flex items-center justify-center text-gray-900 rounded-full bg-transparent hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700"
            >
              <span className="sr-only">Open options</span>
              <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      {isSelected && isComparisonAvailable && (
        <div className="border-green-700 border-b border-l border-r rounded bg-green-50 rounded-t-none p-4">
          <div className="flex justify-between">
            <span className="block text-sm">Compare this scenario</span>
            <Switch
              checked={isComparisonEnabled}
              onChange={setComparisonEnabled}
              className="flex-shrink-0 group relative rounded-full inline-flex items-center justify-center h-4 w-8 cursor-pointer focus:outline-none"
            >
              <span className="sr-only">Comparison scenario setting</span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute w-full h-full rounded-md"
              />
              <span
                aria-hidden="true"
                className={classNames(
                  isComparisonEnabled ? 'bg-green-700' : 'bg-gray-200',
                  'pointer-events-none absolute h-3 w-7 mx-auto rounded-full transition-colors ease-in-out duration-100'
                )}
              />
              <span
                aria-hidden="true"
                className={classNames(
                  isComparisonEnabled ? 'translate-x-4' : 'translate-x-0',
                  'pointer-events-none absolute left-0 inline-block h-4 w-4 border border-gray-200 rounded-full bg-white shadow transform ring-0 transition-transform ease-in-out duration-100'
                )}
              />
            </Switch>
          </div>
          {isComparisonEnabled && <ScenariosComparison />}
        </div>
      )}
    </li>
  );
};

export default ScenariosList;
