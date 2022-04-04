import { useMemo, FC } from 'react';
import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';
import { analysisFilters } from 'store/features/analysis/filters';

import Steps from 'components/steps';

import type { Step } from 'components/steps/types';

import Step1 from './step1';
import Step2 from './step2';

const STEP1: Step = {
  id: 1,
  slug: 'step1',
  title: 'Step 1',
  name: 'Define scope',
  description:
    'Choose to which data of your supply chain you want to apply the intervention in order to analyze changes.',
  status: 'current',
};

const STEPS2 = {
  'new-supplier-location': {
    id: 2,
    title: 'Step 2',
    slug: 'step2',
    name: 'Source from a new supplier or location',
    description:
      'Select a new location or supplier you want to source from in order to analyse changes.',
    status: 'upcoming',
  },
  'production-efficiency': {
    id: 2,
    slug: 'step2',
    title: 'Step 2',
    name: 'Change production efficiency',
    description: 'Setup new impacts in order to analyse the changes.',
    href: '#intervention_step2',
    status: 'upcoming',
  },
  'new-material': {
    id: 2,
    slug: 'step2',
    title: 'Step 2',
    name: 'Switch to a new material',
    description: 'Select a new material you want to source from in order to analyse changes.',
    href: '#intervention_step2',
    status: 'upcoming',
  },
};

const InterventionForm: FC = () => {
  const filters = useAppSelector(analysisFilters);
  const { interventionsStep } = useAppSelector(scenarios);
  const { interventionType } = filters;

  const steps = useMemo(() => [STEP1, STEPS2[interventionType]], [interventionType]);

  return (
    <>
      <Steps steps={steps} current={interventionsStep} className="mb-10 z-20" />
      <div className="mt-12">
        {interventionsStep === 1 && <Step1 />}
        {interventionsStep === 2 && <Step2 />}
      </div>
    </>
  );
};

export default InterventionForm;
