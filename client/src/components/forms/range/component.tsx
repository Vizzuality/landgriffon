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
          <div {...props} className="relative h-6 w-full my-2">
            {children}
            <div className="w-full h-0.5 flex flex-row top-1/2 relative -z-10">
              <div className="h-full bg-gray-600" style={{ width: `${fillPercentage}%` }} />
              <div className="h-full bg-gray-100" style={{ width: `${100 - fillPercentage}%` }} />
            </div>
          </div>
        )}
        renderThumb={({ props, isDragged }) => (
          <div
            {...props}
            className={classNames(
              'relative h-6 w-6 rounded-full border-gray-600 border-2 text-center',
              {
                'bg-white': !isDragged,
                'bg-gray-600': isDragged,
              },
            )}
          >
            {isDragged && (
              <div className="absolute w-14 bottom-0 -translate-y-[calc(50%+.5rem)] text-white bg-black p-2 left-1/2 -translate-x-1/2 rounded-md">
                {value} {unit}
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
