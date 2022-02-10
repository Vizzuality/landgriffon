import type { Step } from './types';
import cx from 'classnames';

import Link from 'next/link';
 
type StepsProps = React.HTMLAttributes<unknown> & {
  steps: Step[];
  current?: string;
};

const Steps: React.FC<StepsProps> = ({ steps, current, ...props }: StepsProps) => (
  <nav aria-label="Progress" {...props}>
    <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
      {steps.map((step) => (
        <li key={step.name} className="md:flex-1">
          {step.status === 'complete' && (
            <Link href={step.href}>
              <a
                href={step.href}
                className={cx(
                  'group pl-4 py-2 flex flex-col border-l-4md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4',
                  {
                    'border-indigo-600 hover:border-indigo-800': step.slug !== current,
                    'border-green-700': step.slug === current,
                  },
                )}
              >
                <span className="text-xs text-indigo-600 font-semibold tracking-wide uppercase group-hover:text-indigo-800">
                  {step.id}
                </span>
                <span className="text-sm font-medium">{step.name}</span>
                {!!step.description && step.slug === current && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </a>
            </Link>
          )}
          {step.status === 'current' && (
            <Link href={step.href}>
              <a
                href={step.href}
                className={cx(
                  'pl-4 py-2 flex flex-col border-l-4 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4',
                  {
                    'border-green-70': step.slug !== current,
                    'border-green-700': step.slug === current,
                  },
                )}
                aria-current="step"
              >
                <span className="text-xs text-indigo-600 font-semibold tracking-wide uppercase">
                  {step.id}
                </span>
                <span className="text-sm font-medium">{step.name}</span>
                {!!step.description && step.slug === current && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </a>
            </Link>
          )}
          {step.status === 'upcoming' && (
            <Link href={step.href}>
              <a
                href={step.href}
                className={cx(
                  'group pl-4 py-2 flex flex-col border-l-4 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4',
                  {
                    'border-gray-200 hover:border-gray-300': step.slug !== current,
                    'border-green-700': step.slug === current,
                  },
                )}
              >
                <span className="text-xs text-gray-500 font-semibold tracking-wide uppercase group-hover:text-gray-700">
                  {step.id}
                </span>
                <span className="text-sm font-medium">{step.name}</span>
                {!!step.description && step.slug === current && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </a>
            </Link>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Steps;
