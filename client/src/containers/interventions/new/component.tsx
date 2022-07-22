import type { FC } from 'react';
import { useMemo } from 'react';
import { useAppSelector } from 'store/hooks';
import { scenarios } from 'store/features/analysis/scenarios';

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

const steps2 = [
  {
    id: 2,
    title: 'Step 2',
    slug: 'step2',
    name: 'Source from a new supplier or location',
    value: 'Source from new supplier or location',
    description:
      'Select a new location or supplier you want to source from in order to analyse changes.',
    status: 'upcoming',
  } as Step,
  {
    id: 2,
    slug: 'step2',
    title: 'Step 2',
    name: 'Change production efficiency',
    value: 'Change production efficiency',
    description: 'Setup new impacts in order to analyse the changes.',
    status: 'upcoming',
  } as Step,
  {
    id: 2,
    slug: 'step2',
    title: 'Step 2',
    name: 'Switch to a new material',
    value: 'Switch to a new material',
    description: 'Select a new material you want to source from in order to analyse changes.',
    status: 'upcoming',
  } as Step,
];

const InterventionForm: FC = () => {
  const { interventionsStep, newInterventionData } = useAppSelector(scenarios);
  const { type } = newInterventionData;

  const STEP2 = useMemo(() => steps2.find(({ value }) => value === type), [type]);
  const steps = useMemo<Step[]>(() => [STEP1, STEP2], [STEP2]);

  return (
    <>
      <Steps steps={steps} current={interventionsStep} className="mb-10 z-20" />
      <div className="space-y-8">
        {interventionsStep === 1 && <Step1 />}
        {interventionsStep === 2 && <Step2 />}
      </div>
    </>
  );
};

export default InterventionForm;
