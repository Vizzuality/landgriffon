import { CubeTransparentIcon } from '@heroicons/react/solid';
import { Input } from 'components/forms';
import ToolTip from 'components/tooltip';
import { useState } from 'react';

interface OpacityControlProps {
  opacity: number;
  onChange: (opacity: number) => void;
}

const OpacityControl: React.FC<OpacityControlProps> = ({ opacity, onChange }) => {
  return (
    <ToolTip
      content={
        <Input
          unit="%"
          type="number"
          defaultValue={Math.round(opacity * 100)}
          className="text-center"
          onChange={(e) => {
            if (Number.isNaN(e.target.valueAsNumber)) return;
            onChange(e.target.valueAsNumber / 100);
          }}
        />
      }
      className="w-16 text-center"
    >
      <CubeTransparentIcon className="w-4 h-4 text-gray-900" />
    </ToolTip>
  );
};

export default OpacityControl;
