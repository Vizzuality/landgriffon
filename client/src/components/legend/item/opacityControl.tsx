import RangeSlider from 'components/forms/range';
import OpacityIcon from 'components/icons/opacity';
import ToolTip from 'components/tooltip';
import { useEffect, useState } from 'react';
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

  return (
    <ToolTip
      content={
        <div className="bg-white p-2 rounded-md shadow-md">
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
        </div>
      }
      className="w-48 text-center"
    >
      <span className="w-4 h-4 text-gray-900">
        <OpacityIcon />
      </span>
    </ToolTip>
  );
};

export default OpacityControl;
