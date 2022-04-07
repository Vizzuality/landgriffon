import { useCallback } from 'react';
import cx from 'classnames';

import { useAppDispatch } from 'store/hooks';
import { setNewInterventionStep } from 'store/features/analysis/scenarios';

import type { Step } from './types';

type StepsProps = React.HTMLAttributes<unknown> & {
  steps: Step[];
  current?: number;
};

const Steps: React.FC<StepsProps> = ({ steps, current }: StepsProps) => {
  const dispatch = useAppDispatch();
  const handleTab = useCallback((step) => dispatch(setNewInterventionStep(step)), [dispatch]);

  const stepDescription = useCallback(
    (description: string) => (
      <p className="text-left text-xs text-gray-500 leading-5 -tracking-tight">{description}</p>
    ),
    [],
  );

  return (
    <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
      {steps.map((step) => (
        <li key={step.name} className="md:flex-1">
          {step.status === 'complete' && (
            <button
              className={cx(
                'w-full group pl-4 py-2 flex flex-col border-l-4md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4',
                {
                  'border-indigo-600 hover:border-indigo-800': step.id !== current,
                  'border-green-700': step.id === current,
                },
              )}
              onClick={() => handleTab(step.id)}
            >
              <span className="text-indigo-600 font-semibold tracking-wide uppercase group-hover:text-indigo-800 leading-4">
                {step.title}
              </span>
              <span className="font-medium text-left leading-5">{step.name}</span>
              {!!step.description && step.id === current && stepDescription(step.description)}
            </button>
          )}
          {step.status === 'current' && (
            <button
              className={cx(
                'w-full pl-4 py-2 flex flex-col border-l-4 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4',
                {
                  'border-green-70': step.id !== current,
                  'border-green-700': step.id === current,
                },
              )}
              aria-current="step"
              onClick={() => handleTab(step.id)}
            >
              <span className="text-indigo-600 font-semibold tracking-wide uppercase leading-4">
                {step.title}
              </span>
              <span className="font-medium text-left leading-5">{step.name}</span>
              {!!step.description && step.id === current && stepDescription(step.description)}
            </button>
          )}
          {step.status === 'upcoming' && (
            <button
              className={cx(
                'w-full group pl-4 py-2 flex flex-col border-l-4 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4',
                {
                  'border-gray-200 hover:border-gray-300': step.id !== current,
                  'border-green-700': step.id === current,
                },
              )}
              onClick={() => handleTab(step.id)}
            >
              <span className="text-gray-500 font-semibold tracking-wide uppercase group-hover:text-gray-700 leading-4">
                {step.title}
              </span>
              <span className="font-medium text-left leading-5">{step.name}</span>
              {!!step.description && step.id === current && stepDescription(step.description)}
            </button>
          )}
        </li>
      ))}
    </ol>
  );
};

export default Steps;
