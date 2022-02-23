import { useCallback, useMemo, FC } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import Steps from 'components/steps';
import Button from 'components/button';

import { setSubContentCollapsed, setNewInterventionStep } from 'store/features/analysis';

import type { Step } from 'components/steps/types';

import Step1 from './step1';
import Step2 from './step2';

const STEP1: Step = {
  id: 'Step 1',
  slug: 1,
  name: 'Define scope',
  description:
    'Choose to which data of your supply chain you want to apply the intervention in order to analyze changes.',
  status: 'current',
};

const STEPS2 = {
  'new-supplier-location': {
    id: 'Step 2',
    slug: 2,
    name: 'Source from a new supplier or location',
    description:
      'Select a new location or supplier you want to source from in order to analyse changes.',
    status: 'upcoming',
  },
  'production-efficiency': {
    id: 'Step 2',
    slug: 'intervention_step2',
    name: 'Change production efficiency',
    description: 'Setup new impacts in order to analyse the changes.',
    href: '#intervention_step2',
    status: 'upcoming',
  },
  'new-material': {
    id: 'Step 2',
    slug: 'intervention_step2',
    name: 'Switch to a new material',
    description: 'Select a new material you want to source from in order to analyse changes.',
    href: '#intervention_step2',
    status: 'upcoming',
  },
};

const InterventionForm: FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(analysis);
  const { interventionType } = filters;
  const { interventions } = useAppSelector(analysis);
  const { step } = interventions;

  const steps = useMemo(() => [STEP1, STEPS2[interventionType]], [interventionType]);

  const handleCancel = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
    dispatch(setNewInterventionStep(1));
  }, [dispatch]);

  const handleContinue = useCallback(() => {
    dispatch(setNewInterventionStep(2));
  }, [dispatch]);

  const handleIntervention = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
  }, [dispatch]);

  return (
    <>
      <Steps steps={steps} current={step} className="mb-10 z-20" />
      <form className="space-y-8">
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        <div className="pt-5">
          <div className="flex justify-end">
            <Button type="button" onClick={handleCancel} theme="secondary">
              Cancel
            </Button>
            {step === 1 && (
              <Button type="button" className="ml-3" onClick={handleContinue}>
                Continue
              </Button>
            )}
            {step === 2 && (
              <Button
                // type="button"
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleIntervention}
              >
                Add intervention
              </Button>
            )}
          </div>
        </div>
      </form>
    </>
  );
};

export default InterventionForm;
