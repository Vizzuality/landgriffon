import classNames from 'classnames';
import React, { useCallback } from 'react';
import { Range } from 'react-range';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  unit?: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, step = 1, value, onChange, unit }) => {
  const handleChange = useCallback(
    (values) => {
      onChange(values[0]);
    },
    [onChange],
  );

  const getFillPercentage = useCallback(
    (value: number) => (100 * (value - min)) / (max - min),
    [min, max],
  );

  const fillPercentage = getFillPercentage(value);

  return (
    <div>
      <Range
        renderTrack={({ props, children }) => (
          <div {...props} className="relative h-6 w-full">
            {children}
            <div className="relative top-1/2 -z-10 flex h-0.5 w-full flex-row">
              <div className="h-full bg-navy-400" style={{ width: `${fillPercentage}%` }} />
              <div className="h-full bg-gray-100" style={{ width: `${100 - fillPercentage}%` }} />
            </div>
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            className={classNames(
              'relative h-4 w-4 rounded-full border-2 border-navy-400 text-center',
              {
                'bg-white': !isDragged,
                'bg-navy-400': isDragged,
              },
            )}
          >
            {isDragged && (
              <div className="absolute left-1/2 top-2 -translate-x-1/2 -translate-y-full">
                <div className="min-w-fit whitespace-nowrap rounded-md bg-black p-2 text-xs text-white">
                  {value} {unit}
                </div>
                <div className="relative bottom-3 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 rounded-sm bg-black" />
              </div>
            )}
          </div>
        )}
        values={[value]}
        step={step}
        min={min}
        max={max}
        onChange={handleChange}
      />
    </div>
  );
};

export default RangeSlider;
