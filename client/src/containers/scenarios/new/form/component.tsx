import { useMemo } from 'react';
import { useRouter } from 'next/router';

import InterventionsForm from 'containers/interventions/new';
import GrowthForm from 'containers/growth';

import CollapseButton from 'containers/collapse-button';

const ScenariosForm = () => {
  const { asPath } = useRouter();
  const tab = useMemo<string>(() => asPath.split('#')[1], [asPath]);
  const growthContent = useMemo<boolean>(() => tab && tab.includes('growth'), [tab]);

  return (
    <div className="p-12 bg-white z-50 h-full">
      {!growthContent && <InterventionsForm />}
      {growthContent && <GrowthForm />}
      <div className="absolute top-5 right-0 transform translate-x-1/2 z-30">
        <CollapseButton />
      </div>
    </div>
  );
};

export default ScenariosForm;