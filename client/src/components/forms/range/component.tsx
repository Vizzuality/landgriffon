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
            <div className="w-full h-0.5 flex flex-row top-1/2 relative -z-10">
              <div className="h-full bg-navy-400" style={{ width: `${fillPercentage}%` }} />
              <div className="h-full bg-gray-100" style={{ width: `${100 - fillPercentage}%` }} />
            </div>
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            className={classNames(
              'relative h-4 w-4 rounded-full border-navy-400 border-2 text-center',
              {
                'bg-white': !isDragged,
                'bg-navy-400': isDragged,
              },
            )}
          >
            {isDragged && (
              <div className="absolute top-2 -translate-y-full left-1/2 -translate-x-1/2">
                <div className="min-w-fit text-white bg-black p-2 rounded-md text-xs whitespace-nowrap">
                  {value} {unit}
                </div>
                <div className="bg-black w-4 h-4 relative left-1/2 -translate-x-1/2 bottom-3 rotate-45 rounded-sm" />
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
