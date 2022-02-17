import { useMemo } from 'react';
import { PlusIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { Button } from 'components/button';
import Link from 'next/link';

import cx from 'classnames';

const items = [
  {
    id: 1,
    title: 'Set growth rate for all materials to +2%/yr in 2020',
  },
  {
    id: 2,
    title: 'Set growth rate for all materials to +2%/yr in 2020',
  },
  {
    id: 3,
    title: 'Set growth rate for all materials to +2%/yr in 2020',
  },
];

const interventions = [
  {
    id: 1,
    title: 'Replace <strong>50% of Palm Oil</strong> with Soybean Oil (RFA-certified) by 2025',
  },
  {
    id: 2,
    title: 'Change supplier of Rubber for pep.a.1.001 to Namazie International in 2022',
  },
  {
    id: 3,
    title: 'Change production efficiency of Palm oil for pep.a1 in 2 regions by 2025',
  },
  {
    id: 4,
    title: 'Change production efficiency of Cocoa for pep.a1 in 2 regions by 2025',
  },
];

const ScenarioAttributes = ({ handleNewIntervention }) => {
  const { asPath } = useRouter();
  const tab = useMemo<string>(() => asPath.split('#')[1], [asPath]);
  const interventionsContent = !tab || tab?.includes('intervention');

  return (
    <div className="relative">
      <div className="flex items-center content-between text-sm">
        <div className="pb-6 flex items-center justify-between w-full">
          <div className="space-x-2">
            <Link href="#intervention_step1">
              <a
                href="#interventions"
                className={cx({ 'border-b-2 border-green-700': interventionsContent })}
              >
                Interventions (0)
              </a>
            </Link>
            <Link href="#growth">
              <a
                href="#growth"
                className={cx({ 'border-b-2 border-green-700': !interventionsContent })}
              >
                Growth rates ({items.length})
              </a>
            </Link>
          </div>
          <Button onClick={() => handleNewIntervention()}>
            <PlusIcon className="-ml-1 mr-1 h-5 w-5" aria-hidden="true" />
            New
          </Button>
        </div>
      </div>
      {!interventionsContent && items.length && (
        <div className="bg-white border border-gray-300 overflow-hidden rounded-md mt-4">
          <ul className="divide-y divide-gray-300">
            {items.map((item) => (
              <li key={item.id} className="px-4 py-4 sm:px-6">
                <p>{item.title}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {interventionsContent && !interventions.length && (
        <p className="mt-4 text-sm text-center">
          Each intervention is a specific change in sourcing. Create an intervention to get started
        </p>
      )}

      {interventionsContent && interventions.length && (
        <div className="bg-white border border-gray-300 overflow-hidden rounded-md mt-4">
          <ul className="divide-y divide-gray-300 text-sm">
            {interventions.map((intervention) => (
              <li key={intervention.id} className="px-4 py-4 sm:px-6">
                <p>{intervention.title}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!interventionsContent && !items.length && (
        <div>
          <div className="p-6 text-center">
            <p className="text-sm">
              Growth rates set your expectations of how purchaces of raw materials will change into{' '}
              the future. Add a new rule to get started.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioAttributes;
