import React from 'react';
import Hint from '../hint';
import classnames from 'classnames';

const THEMES = {
  default: {
    base: 'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none text-sm',
    icon: 'absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3',
    unit: 'absolute right-3 text-sm text-gray-500',
  },
  'inline-primary': {
    base: 'appearance-none w-full text-center text-green-700 font-bold border-0 border-b-2 border-green-700 px-0 py-0 focus:outline-none focus:border-green-700 focus:ring-0',
    icon: 'absolute w-4 h-4 text-green-700 transform -translate-y-1/2 top-1/2 left-0',
    unit: 'absolute right-0 text-sm font-bold text-green-700',
  },
};

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  theme?: 'default' | 'inline-primary';
  className?: string;
  type?: string;
  // https://github.com/tailwindlabs/heroicons/issues/64#issuecomment-859168741
  icon?: (props: React.ComponentProps<'svg'>) => JSX.Element;
  unit?: string;
  error?: string | boolean;
  showHint?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = 'text', theme = 'default', icon, unit, error, showHint = true, ...props },
    ref,
  ) => {
    const Icon = icon;

    return (
      <div className={classnames('relative mt-1', className)}>
        <div className="flex items-center">
          {icon && <Icon className={THEMES[theme].icon} />}
          <input
            className={classnames([THEMES[theme].base], {
              // The Checkbox component should be used instead, but just in case.
              'px-0': type === 'checkbox',
              'bg-gray-400 h-1 appearance-none': type === 'range',
              'pl-10': !!icon && theme !== 'inline-primary',
              'pl-3': !!icon && theme === 'inline-primary',
              'border-gray-200 focus:ring-green-700 focus:border-green-700':
                theme === 'default' && !error,
              'border-red-600 focus:ring-red-600 focus:border-red-600': !!error,
              'pr-8': type === 'search',
              'bg-gray-100': props.disabled,
            })}
            type={type}
            ref={ref}
            // We need to make space for units. This is far from ideal, should be able to
            // approximate a padding based on the unit's character length to a good degree.
            // ~10px per character, + 14px for extra right padding.
            // If the input is the 'search' type, we won't be displaying units, and we'll
            // already be giving a right padding via TailwindCSS classes in order to make
            // room for the "clear search" button.
            style={{
              marginRight:
                type !== 'search' &&
                unit &&
                unit?.length * 10 + (theme === 'inline-primary' ? 2 : 14),
            }}
            {...props}
          />
          {unit && <span className={THEMES[theme].unit}>{unit}</span>}
        </div>
        {error && showHint && <Hint>{error}</Hint>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
