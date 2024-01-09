import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'rooks';

import RangeSlider from 'components/forms/range';
import OpacityIcon from 'components/icons/opacity';
import ToolTip from 'components/tooltip';

interface OpacityControlProps {
  opacity: number;
  onChange: (opacity: number) => void;
}

const OpacityControl: React.FC<OpacityControlProps> = ({ opacity, onChange }) => {
  const debouncedChange = useDebounce(onChange, 200);
  const [rangeValue, setRangeValue] = useState(Math.round(opacity * 100));

  useEffect(() => {
    debouncedChange(rangeValue / 100);
  }, [debouncedChange, rangeValue]);

  const TooltipContent = useMemo(
    () => (
      <div className="w-52 rounded-md bg-white px-4 py-2">
        <div className="text-left text-2xs text-gray-500">Opacity</div>
        <RangeSlider
          unit="%"
          min={0}
          max={100}
          value={rangeValue}
          className="w-full rounded-md"
          onChange={(value) => {
            setRangeValue(value);
          }}
        />
        <div className="flex w-full flex-row justify-between text-2xs text-gray-300">
          <div>0%</div>
          <div>100%</div>
        </div>
      </div>
    ),
    [rangeValue],
  );

  return (
    <ToolTip arrow={false} content={TooltipContent} className="w-54 text-center">
      <span className="h-4 w-4 text-gray-900">
        <OpacityIcon />
      </span>
    </ToolTip>
  );
};

export default OpacityControl;
