import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { createScenario } from 'services/scenarios';

const ScenariosNewContainer: React.FC = () => {
  const router = useRouter();

  const response = useQuery('scenarioNew', () => createScenario({ title: 'Untitled' }));

  if (response.isSuccess) {
    router.replace({
      pathname: '/analysis',
      query: {
        edit_scenario: response.data.id,
      },
    });
  }

  return null;
};

export default ScenariosNewContainer;
