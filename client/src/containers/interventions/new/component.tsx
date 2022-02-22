import { useCallback, useMemo, FC } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { analysis } from 'store/features/analysis';

import Link from 'next/link';

import Steps from 'components/steps';
import { setSubContentCollapsed } from 'store/features/analysis';

import type { Step } from 'components/steps/types';

import Step1 from './step1';
import Step2 from './step2';

const STEP1: Step = {
  id: 'Step 1',
  slug: 'intervention_step1',
  name: 'Define scope',
  description:
    'Choose to which data of your supply chain you want to apply the intervention in order to analyze changes.',
  href: '#intervention_step1',
  status: 'current',
};

const STEPS2 = {
  new_supplier_location: {
    id: 'Step 2',
    slug: 'intervention_step2',
    name: 'Source from a new supplier or location',
    description:
      'Select a new location or supplier you want to source from in order to analyse changes.',
    href: '#intervention_step2',
    status: 'upcoming',
  },
  production_efficiency: {
    id: 'Step 2',
    slug: 'intervention_step2',
    name: 'Change production efficiency',
    description: 'Setup new impacts in order to analyse the changes.',
    href: '#intervention_step2',
    status: 'upcoming',
  },
  new_material: {
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
  const { asPath } = useRouter();
  const { filters } = useAppSelector(analysis);
  const { interventionType } = filters;

  const steps = useMemo(() => [STEP1, STEPS2[interventionType]], [interventionType]);

  const currentStep = useMemo<string>(() => asPath.split('#')[1], [asPath]);
  const isFirstStep = useMemo<boolean>(() => currentStep === 'intervention_step1', [currentStep]);
  const handleCancel = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
  }, [dispatch]);

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
            {!!currentStep && !isFirstStep && (
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add intervention
              </button>
            )}
            {(!currentStep || isFirstStep) && (
              <Link href="#intervention_step2" shallow passHref>
                <a
                  href="#intervention_step2"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue
                </a>
              </Link>
            )}
          </div>
        </div>
      </form>
    </>
  );
};

export default InterventionForm;
