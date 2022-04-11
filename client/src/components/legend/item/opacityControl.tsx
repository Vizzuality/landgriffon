import { EyeIcon } from '@heroicons/react/solid';
import { Input } from 'components/forms';
import { useState } from 'react';

interface OpacityControlProps {
  opacity: number;
  onChange: (opacity: number) => void;
}

const OpacityControl: React.FC<OpacityControlProps> = ({ opacity, onChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <>
      <button>
        <EyeIcon
          className="w-4 h-4 text-gray-900"
          onClick={() => {
            setIsVisible((visible) => !visible);
          }}
        />
        {isVisible && (
          <Input
            type="number"
            defaultValue={Math.round(opacity * 100)}
            onChange={(e) => {
              if (Number.isNaN(e.target.valueAsNumber)) return;
              onChange(e.target.valueAsNumber / 100);
            }}
          />
        )}
      </button>
    </>
  );
};

export default OpacityControl;
