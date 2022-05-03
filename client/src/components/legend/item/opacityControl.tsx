import { Input } from 'components/forms';
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
        <Input
          unit={`${rangeValue} %`}
          type="range"
          min={0}
          max={100}
          step={1}
          value={rangeValue}
          className="appearance-none bg-yellow-700 w-full ring-2"
          onChange={(e) => {
            // if (Number.isNaN(e.target.valueAsNumber)) return;
            setRangeValue(e.currentTarget.valueAsNumber);
            // debouncedChange(e.target.valueAsNumber / 100);
          }}
        />
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
