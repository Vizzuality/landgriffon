import { FC } from 'react';
import { useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import InterventionsForm from 'containers/interventions/new';
import GrowthForm from 'containers/growth';

import CollapseButton from 'containers/collapse-button';

const ScenariosForm: FC = () => {
<<<<<<< HEAD
<<<<<<< HEAD
  const { scenarioCurrentTab } = useAppSelector(analysis);

  return (
    <div className="p-12 bg-white z-50 h-full">
      {scenarioCurrentTab === 'interventions' && <InterventionsForm />}
      {scenarioCurrentTab === 'growth' && <GrowthForm />}
=======
  const { currentTab } = useAppSelector(analysis);
  const { tab } = currentTab;

  return (
    <div className="p-12 bg-white z-50 h-full">
      {tab === 'interventions' && <InterventionsForm />}
      {tab === 'growth' && <GrowthForm />}
>>>>>>> 872e8ce9 (steps WIP)
=======
  const { scenarioCurrentTab } = useAppSelector(analysis);

  return (
    <div className="p-12 bg-white z-50 h-full">
      {scenarioCurrentTab === 'interventions' && <InterventionsForm />}
      {scenarioCurrentTab === 'growth' && <GrowthForm />}
>>>>>>> 1701329b (new scen componentized, scen attributes removed)
      <div className="absolute top-5 right-0 transform translate-x-1/2 z-30">
        <CollapseButton />
      </div>
    </div>
  );
};

export default ScenariosForm;
