import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { createScenario } from 'services/scenarios';

import Interventions from 'containers/interventions';
import InterventionForm from 'containers/scenarios/new/form';
import CollapseButton from 'containers/collapse-button';
import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysis, setSubContentCollapsed } from 'store/features/analysis';


const ScenariosNewContainer: React.FC = () => {
  const router = useRouter();

  const [newIntervention, setNewIntervention] = useState(false);
  const response = useQuery('scenarioNew', () => createScenario({ title: 'Untitled' }));

  if (response.isSuccess) {
    // router.replace({
    //   pathname: '/analysis',
    //   query: {
    //     new_scenario: response.data.id,
    //   },
    // });
  }
  const dispatch = useAppDispatch();
  const handleNewIntervention = useCallback(() => {
    dispatch(setSubContentCollapsed(false));
    setNewIntervention(true);
  }, []);

  return (
      <>
    <form action="#" method="POST" className='z-20 bg-green-500'>
      <label htmlFor="title" className="block text-sm text-gray-900">

      </label>
      <input
        type="text"
        name="title"
        id="title"
        placeholder="Untitled"
        autoFocus
        className="flex-1 block w-full md:text-2xl sm:text-sm border-none text-gray-400 p-0 font-semibold mb-6"
      />

      <div className="sm:col-span-6">
        <label htmlFor="description" className="block text-sm text-gray-900">
          Scenario description <span className="text-gray-500">(optional)</span>
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={3}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
            defaultValue=""
          />
        </div>
      </div>
    </form>
    <div className="h-full flex flex-col w-auto bg-white py-6 overflow-auto relative">
          <Interventions handleNewIntervention={handleNewIntervention}/>
       {newIntervention && <div className="absolute h-full left-125 top-0 right-10">
          <InterventionForm />
        </div>}
        </div>

        </>
  );
};

export default ScenariosNewContainer;
