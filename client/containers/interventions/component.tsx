import { useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/solid';
import { useAppDispatch } from 'store/hooks';
import { setSubContentCollapsed } from 'store/features/analysis';
import { Button } from 'components/button';

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

const Interventions = () => {
  const dispatch = useAppDispatch();
  const handleNewIntervention = useCallback(() => {
    dispatch(setSubContentCollapsed(false));
  }, []);

  return (
    <div>
      <div className="flex items-center content-between">
        <div className="flex-1">{items.length} interventions</div>
        <Button onClick={handleNewIntervention}>
          <PlusIcon className="-ml-1 mr-1 h-5 w-5" aria-hidden="true" />
          New
        </Button>
      </div>
      <div className="bg-white border border-gray-300 overflow-hidden rounded-md mt-4">
        <ul className="divide-y divide-gray-300">
          {items.map((item) => (
            <li key={item.id} className="px-4 py-4 sm:px-6">
              <p>{item.title}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Interventions;
