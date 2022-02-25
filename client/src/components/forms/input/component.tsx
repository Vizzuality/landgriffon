import React from 'react';
import Hint from '../hint';
import classnames from 'classnames';

const THEMES = {
  default: {
    base: 'appearance-none block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-green-700 focus:border-green-700 text-sm',
    icon: 'absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 top-1/2 left-3',
    unit: 'absolute right-3 text-sm text-gray-500',
  },
};

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  theme?: 'default';
  type?: string;
  // https://github.com/tailwindlabs/heroicons/issues/64#issuecomment-859168741
  icon?: (props: React.ComponentProps<'svg'>) => JSX.Element;
  unit?: string;
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', theme = 'default', icon, unit, error, ...props }, ref) => {
    const Icon = icon;

    return (
      <div className={classnames('relative mt-1', className)}>
        <div className="flex items-center">
          {icon && <Icon className={THEMES[theme].icon} />}
          <input
            className={classnames([THEMES[theme].base], {
              // The Checkbox component should be used instead, but just in case.
              'px-0': type === 'checkbox',
              'pl-10': !!icon,
              'border-red-600': !!error,
            })}
            type={type}
            ref={ref}
            // We need to make space for units. This is far from ideal, should be able to
            // approximate a padding based on the unit's character length to a good degree.
            // ~10px per character, + 14px for extra right padding.
            style={{
              paddingRight: unit && unit?.length * 10 + 14,
            }}
            {...props}
          />
          {unit && <span className={THEMES[theme].unit}>{unit}</span>}
        </div>
        {error && <Hint>{error}</Hint>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
