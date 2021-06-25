import { useState } from 'react';
import { format } from 'date-fns';
import { RadioGroup } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/solid';

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
    id: 3,
    updatedAt: Date.now(),
    user: { name: 'Francis' },
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Scenarios() {
  const [selected, setSelected] = useState(projects[0]);

  return (
    <RadioGroup value={selected} onChange={setSelected}>
      <RadioGroup.Label className="sr-only">Scenarios</RadioGroup.Label>
      <ul className="my-4 grid grid-cols-1 gap-5 sm:gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {projects.map((project) => (
          <li key={project.name} className="col-span-1 shadow-sm rounded-md">
            <div className="flex items-center border border-gray-200 bg-white rounded">
              <RadioGroup.Option
                key={project.name}
                value={project}
                className="flex-1 flex items-center justify-between truncate"
              >
                {({ checked }) => (
                  <>
                    <div className="flex-shrink-0 flex items-center justify-center w-10">
                      <span
                        className={classNames(
                          checked ? 'bg-green-700 border-transparent' : 'bg-white border-gray-300',
                          'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center'
                        )}
                        aria-hidden="true"
                      >
                        <span className="rounded-full bg-white w-1.5 h-1.5" />
                      </span>
                    </div>
                    <div className="flex-1 pr-4 py-2 text-sm truncate">
                      <h2 className="text-gray-900 font-medium">{project.name}</h2>
                      <p className="text-gray-500">
                        Last edited {format(project.updatedAt, 'yyyy/MM/dd')} by {project.user.name}
                      </p>
                    </div>
                  </>
                )}
              </RadioGroup.Option>
              <div className="flex-shrink-0 pr-2">
                <button
                  type="button"
                  className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700"
                >
                  <span className="sr-only">Open options</span>
                  <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </RadioGroup>
  );
}
