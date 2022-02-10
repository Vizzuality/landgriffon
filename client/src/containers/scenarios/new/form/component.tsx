import { useCallback, useMemo } from 'react';
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
    name: 'Define scope',
    href: '#step1',
    status: 'current',
  },
  {
    id: 'Step 2',
    name: 'Source from a new supplier or location',
    description: 'Select a new location or supplier you want to source from in order to analyse changes.',
    href: '#step2',
    status: 'upcoming',
  },
];

const InterventionForm = () => {
  const dispatch = useAppDispatch();
  const { asPath } = useRouter();

  const currentStep = useMemo<string>(() => asPath.split('#')[1], [asPath]);

  const handleCancel = useCallback(() => {
    dispatch(setSubContentCollapsed(true));
  }, []);
  console.log(currentStep, currentStep === 'step1', 'ecenario new')
  return (
    <div className="p-12 bg-white z-50 h-full">
      <Steps steps={steps} className="mb-10 z-20" />
      <form className="space-y-8">
        { <Step1 />}
        {currentStep === 'step2' && <Step2 />}
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
              Add intervention
            </button>
          </div>
        </div>
      </form>
      </div>
  );
};

export default InterventionForm;