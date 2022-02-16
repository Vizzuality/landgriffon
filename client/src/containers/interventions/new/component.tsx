<<<<<<< HEAD
import { useCallback, useMemo, useState } from 'react';
=======
import { useCallback, useMemo } from 'react';
>>>>>>> b7c3ded (new scenario options layout)
import { useRouter } from 'next/router';
import { useAppDispatch } from 'store/hooks';
import Steps from 'components/steps';
import { setSubContentCollapsed } from 'store/features/analysis';

import type { Step } from 'components/steps/types';

import Step1 from './step1';
import Step2 from './step2';

const steps: Step[] = [
  {
    id: 'Step 1',
    slug: 'intervention_step1',
    name: 'Define scope',
    description:
      'Choose to which data of your supply chain you want to apply the intervention in order to analyze changes.',
    href: '#intervention_step1',
    status: 'current',
  },
  {
    id: 'Step 2',
    slug: 'intervention_step2',
    name: 'Source from a new supplier or location',
    description:
      'Select a new location or supplier you want to source from in order to analyse changes.',
    href: '#intervention_step2',
    status: 'upcoming',
  },
];

const InterventionForm = () => {
  const dispatch = useAppDispatch();
  const { asPath } = useRouter();

  const currentStep = useMemo<string>(() => asPath.split('#')[1], [asPath]);
  const isFirstStep = useMemo<boolean>(() => currentStep === 'intervention_step1', [currentStep]);
  const handleCancel = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
  }, []);

  return (
    <>
      <Steps steps={steps} current={currentStep} className="mb-10 z-20" />
      <form className="space-y-8">
        {(!currentStep || isFirstStep) && <Step1 />}
        {!!currentStep && !isFirstStep && <Step2 />}
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default InterventionForm;
