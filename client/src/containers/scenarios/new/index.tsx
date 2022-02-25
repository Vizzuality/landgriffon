import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { createScenario } from 'services/scenarios';

import InterventionsAttributes from 'containers/scenarios/attributes';
import Textarea from 'components/forms/textarea';
import { useAppDispatch } from 'store/hooks';
import { setSubContentCollapsed } from 'store/features/analysis';

const ScenariosNewContainer: React.FC = () => {
  const response = useQuery('scenarioNew', () => createScenario({ title: 'Untitled' }));

  if (response.isSuccess) {
    // router.replace({
    //   pathname: '/analysis/scenario',
    //   query: {
    //     new: response.data.id,
    //   },
    // });
  }
  const dispatch = useAppDispatch();
  const handleNewIntervention = useCallback(() => {
    dispatch(setSubContentCollapsed(false));
  }, [dispatch]);

  return (
    <>
      <form action="#" method="POST" className="z-20">
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Untitled"
          aria-label="sceanrio title"
          autoFocus
          className="flex-1 block w-full md:text-2xl sm:text-sm border-none text-gray-400 p-0 font-semibold mb-6"
        />

        <div className="sm:col-span-6">
          <label htmlFor="description" className="block text-sm text-gray-900">
            Scenario description <span className="text-gray-500">(optional)</span>
          </label>
          <div className="mt-1">
            <Textarea
              id="description"
              name="description"
              rows={3}
              className="w-full"
              defaultValue=""
            />
          </div>
        </div>
      </form>
      <div className="h-full flex flex-col w-auto bg-white py-6 overflow-auto relative">
        <InterventionsAttributes handleNewIntervention={handleNewIntervention} />
      </div>
    </>
  );
};

export default ScenariosNewContainer;
