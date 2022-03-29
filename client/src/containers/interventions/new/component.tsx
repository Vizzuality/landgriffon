import { useCallback, useMemo, FC } from 'react';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setSubContentCollapsed } from 'store/features/analysis/ui';
import { scenarios, setNewInterventionStep } from 'store/features/analysis/scenarios';
import { analysisFilters } from 'store/features/analysis/filters';

import Steps from 'components/steps';
import Button from 'components/button';

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
  const dispatch = useAppDispatch();
  const filters = useAppSelector(analysisFilters);
  const { interventionsStep } = useAppSelector(scenarios);
  const { interventionType } = filters;

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
      <Steps steps={steps} current={interventionsStep} className="mb-10 z-20" />
      <form className="space-y-8 mt-16">
        {interventionsStep === 1 && <Step1 />}
        {interventionsStep === 2 && <Step2 />}
        <div className="pt-5">
          <div className="flex justify-end">
            <Button type="button" onClick={handleCancel} theme="secondary">
              Cancel
            </Button>
            {interventionsStep === 1 && (
              <Button type="button" className="ml-3" onClick={handleContinue}>
                Continue
              </Button>
            )}
            {interventionsStep === 2 && (
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
