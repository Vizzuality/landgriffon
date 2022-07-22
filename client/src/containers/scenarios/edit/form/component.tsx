import type { FC } from 'react';
import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';

import InterventionsForm from 'containers/interventions/new';
import GrowthForm from 'containers/growth';

import CollapseButton from 'containers/collapse-button';

const ScenariosForm: FC = () => {
  const { scenarioCurrentTab } = useAppSelector(scenarios);

  return (
    <div className="p-12 bg-white z-50 h-full">
      {scenarioCurrentTab === 'interventions' && <InterventionsForm />}
      {scenarioCurrentTab === 'growth' && <GrowthForm />}
      <div className="absolute top-5 right-0 transform translate-x-1/2 z-30">
        <CollapseButton />
      </div>
    </div>
  );
};

export default ScenariosForm;
