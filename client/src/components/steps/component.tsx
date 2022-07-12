import { useCallback, useMemo } from 'react';
import cx from 'classnames';

import { useAppDispatch, useAppSelector } from 'store/hooks';
import { scenarios, setNewInterventionStep } from 'store/features/analysis/scenarios';

import type { Step } from './types';

type StepsProps = React.HTMLAttributes<unknown> & {
  steps: Step[];
  current?: number;
};

const Steps: React.FC<StepsProps> = ({ steps, current }: StepsProps) => {
  const dispatch = useAppDispatch();
  const handleTab = useCallback((step) => dispatch(setNewInterventionStep(step)), [dispatch]);
  const { newInterventionData } = useAppSelector(scenarios);
  const {
    title,
    percentage,
    materialIds,
    businessUnitIds,
    startYear,
    endYear,
    type,
    supplierIds,
    adminRegionIds,
  } = newInterventionData;
  const hasErrors = useMemo(
    () =>
      [
        title,
        percentage,
        materialIds,
        businessUnitIds,
        startYear,
        endYear,
        type,
        supplierIds,
        adminRegionIds,
      ].some((el) => !el),
    [
      title,
      percentage,
      materialIds,
      businessUnitIds,
      startYear,
      endYear,
      type,
      supplierIds,
      adminRegionIds,
    ],
  );

  return (
    <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
      {steps.map((step) => (
        <li key={step.name} className="md:flex-1">
          {step.status === 'complete' && (
            <button
              type="button"
              className={cx(
                'w-full group pl-4 py-2 flex flex-col border-l-4md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4',
                {
                  'border-indigo-600 hover:border-indigo-800 cursor-pointer':
                    step.id !== current && !hasErrors,
                  'border-green-700': step.id === current,
                },
              )}
              onClick={() => handleTab(step.id)}
            >
              <span className="text-xs font-semibold leading-4 tracking-wide text-indigo-600 uppercase group-hover:text-indigo-800">
                {step.title}
              </span>
              <span className="text-sm font-medium leading-5 text-left">{step.name}</span>
              {!!step.description && step.id === current && (
                <p className="text-xs leading-5 text-left text-gray-500 -tracking-tight">
                  {step.description}
                </p>
              )}
            </button>
          )}
          {step.status === 'current' && (
            <button
              type="button"
              className={cx(
                'w-full pl-4 py-2 flex flex-col border-l-4 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4',
                {
                  'border-green-70 cursor-pointer': step.id !== current && !hasErrors,
                  'border-green-700': step.id === current,
                },
              )}
              aria-current="step"
              onClick={() => handleTab(step.id)}
            >
              <span className="text-xs font-semibold leading-4 tracking-wide text-indigo-600 uppercase">
                {step.title}
              </span>
              <span className="text-sm font-medium leading-5 text-left">{step.name}</span>
              {!!step.description && step.id === current && (
                <p className="text-xs leading-5 text-left text-gray-500 -tracking-tight">
                  {step.description}
                </p>
              )}
            </button>
          )}
          {step.status === 'upcoming' && (
            <button
              type="button"
              className={cx(
                'w-full group pl-4 py-2 flex flex-col border-l-4 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4',
                {
                  'border-gray-200 hover:border-gray-300 cursor-pointer':
                    step.id !== current && !hasErrors,
                  'border-green-700': step.id === current,
                },
              )}
              disabled={hasErrors}
              onClick={() => handleTab(step.id)}
            >
              <span className="text-xs font-semibold leading-4 tracking-wide text-gray-500 uppercase group-hover:text-gray-700">
                {step.title}
              </span>
              <span className="text-sm font-medium leading-5 text-left">{step.name}</span>
              {!!step.description && step.id === current && (
                <p className="text-xs leading-5 text-left text-gray-500 -tracking-tight">
                  {step.description}
                </p>
              )}
            </button>
          )}
        </li>
      ))}
    </ol>
  );
};

export default Steps;
