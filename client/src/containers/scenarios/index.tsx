import { useRouter } from 'next/router';
import { useScenarios } from 'hooks/scenarios';
import Component from './component';

const ScenariosContainer: React.FC = () => {
  const router = useRouter();
  const {
    query: { sortBy },
  } = router;
  const queryParams = { sort: sortBy };
  const { data } = useScenarios(queryParams);

  return <Component scenarios={data} />;
};

export default ScenariosContainer;
