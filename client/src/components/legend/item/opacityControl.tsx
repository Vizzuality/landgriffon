import RangeSlider from 'components/forms/range';
import OpacityIcon from 'components/icons/opacity';
import ToolTip from 'components/tooltip';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'rooks';

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
      <div className="bg-white px-4 py-1 rounded-md w-52">
        <div className="text-left text-gray-700">Opacity</div>
        <RangeSlider
          unit="%"
          min={0}
          max={100}
          value={rangeValue}
          className="rounded-md w-full"
          onChange={(value) => {
            setRangeValue(value);
          }}
        />
        <div className="flex flex-row justify-between w-full text-gray-400">
          <div>0%</div>
          <div>100%</div>
        </div>
      </div>
    ),
    [rangeValue],
  );

  return (
    <ToolTip arrow={false} content={TooltipContent} className="w-54 text-center">
      <span className="w-4 h-4 text-gray-900">
        <OpacityIcon />
      </span>
    </ToolTip>
  );
};

export default OpacityControl;
