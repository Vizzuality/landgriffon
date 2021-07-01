import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { RadioGroup, Switch } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/solid';
import classNames from 'classnames';

const projects = [
  {
    name: 'Scenario name 1',
    id: 1,
    updatedAt: Date.now(),
    user: { name: 'Francis' },
  },
  {
    name: 'Scenario name 2',
    id: 2,
    updatedAt: Date.now(),
    user: { name: 'Francis' },
  },
  {
    name: 'Scenario name 3',
    id: 3,
    updatedAt: Date.now(),
    user: { name: 'Francis' },
  },
  {
    name: 'Scenario name 4',
    id: 4,
    updatedAt: Date.now(),
    user: { name: 'Francis' },
  },
];

export default function Scenarios() {
  const [selected, setSelected] = useState(projects[0]);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);

  const handleOnChange = useCallback((project) => {
    setSelected(project);
    // Disabling comparison when user change of scenario
    setComparisonEnabled(false);
  }, []);

  return (
    <RadioGroup value={selected} onChange={handleOnChange}>
      <RadioGroup.Label className="sr-only">Scenarios</RadioGroup.Label>
      <ul className="my-2 grid grid-cols-1 gap-5 sm:gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {projects.map((project) => (
          <li key={project.name} className="col-span-1 rounded-md">
            <div
              className={classNames('flex items-center border border-gray-200 bg-white rounded', {
                'border-green-700 bg-green-50 rounded-b-none': selected.id === project.id,
              })}
            >
              <RadioGroup.Option
                key={project.name}
                value={project}
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
                      <h2 className="text-gray-900 text-sm font-medium">{project.name}</h2>
                      <p className="text-gray-600 text-sm">
                        Last edited {format(project.updatedAt, 'yyyy/MM/dd')} by {project.user.name}
                      </p>
                    </div>
                  </>
                )}
              </RadioGroup.Option>
              <div className="flex-shrink-0 pr-2">
                <button
                  type="button"
                  className="w-8 h-8 inline-flex items-center justify-center text-gray-900 rounded-full bg-transparent hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700"
                >
                  <span className="sr-only">Open options</span>
                  <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            {project.id === selected.id && (
              <div className="border-green-700 border-b border-l border-r rounded bg-green-50 rounded-t-none p-4">
                <div className="flex justify-between">
                  <span className="block text-sm">Compare this scenario</span>
                  <Switch
                    checked={comparisonEnabled}
                    onChange={setComparisonEnabled}
                    className="flex-shrink-0 group relative rounded-full inline-flex items-center justify-center h-4 w-8 cursor-pointer focus:outline-none"
                  >
                    <span className="sr-only">Use setting</span>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute w-full h-full rounded-md"
                    />
                    <span
                      aria-hidden="true"
                      className={classNames(
                        comparisonEnabled ? 'bg-green-700' : 'bg-gray-200',
                        'pointer-events-none absolute h-3 w-7 mx-auto rounded-full transition-colors ease-in-out duration-200'
                      )}
                    />
                    <span
                      aria-hidden="true"
                      className={classNames(
                        comparisonEnabled ? 'translate-x-4' : 'translate-x-0',
                        'pointer-events-none absolute left-0 inline-block h-4 w-4 border border-gray-200 rounded-full bg-white shadow transform ring-0 transition-transform ease-in-out duration-200'
                      )}
                    />
                  </Switch>
                </div>
                {comparisonEnabled && (
                  <div className="mt-2">
                    <select
                      id="location"
                      name="location"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-200 focus:outline-none focus:ring-green-700 focus:border-green-700 sm:text-sm rounded-md"
                      defaultValue="Canada"
                    >
                      <option>USA</option>
                      <option>Canada</option>
                      <option>EU</option>
                    </select>
                    <select
                      id="location"
                      name="location"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-200 focus:outline-none focus:ring-green-700 focus:border-green-700 sm:text-sm rounded-md"
                      defaultValue="Canada"
                    >
                      <option>USA</option>
                      <option>Canada</option>
                      <option>EU</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </RadioGroup>
  );
}
