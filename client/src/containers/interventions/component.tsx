import { useCallback, useState } from 'react';
import { PlusIcon } from '@heroicons/react/solid';
import { useAppDispatch } from 'store/hooks';
import { useRouter } from 'next/router';
import { setSubContentCollapsed } from 'store/features/analysis';
import { Button } from 'components/button';
import Breadcrumb from 'components/breadcrumb/component';
import InterventionForm from 'containers/interventions/form';

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

const Interventions = ({ handleNewIntervention }) => {

  const [tab, setTab] = useState('intervention');

  return (
    <div className="relative">
      <div className="flex items-center content-between text-sm">
        <div className="pb-6 flex items-center justify-between w-full">
          <div className="space-x-2">
            <button
              onClick={() => setTab('intervention')}
              className={cx({'border-b-2 border-green-700': tab === 'intervention'})}
            >
              Interventions ({items.length})</button>
            <button
              onClick={() => setTab('growth')}
              className={cx({'border-b-2 border-green-700': tab === 'growth'})}
            >Growth rates</button>
          </div>
          <Button onClick={handleNewIntervention}>
            <PlusIcon className="-ml-1 mr-1 h-5 w-5" aria-hidden="true" />
            New
          </Button>
        </div>
      </div>
      {tab === 'intervention' && (
        <div className="bg-white border border-gray-300 overflow-hidden rounded-md mt-4">
          <ul className="divide-y divide-gray-300">
            {items.map((item) => (
              <li key={item.id} className="px-4 py-4 sm:px-6">
                <p>{item.title}</p>
              </li>
            ))}
          </ul>
        </div>)}
      {tab !== 'intervention' && (
        <div>
          <div className="p-6 text-center">
            <p>Growth rates set your expectations of how  purchaces of raw materials will change into the future. Add a new rule to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interventions;
