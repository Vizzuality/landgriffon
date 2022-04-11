import { Input } from 'components/forms';
import OpacityIcon from 'components/icons/opacity';
import ToolTip from 'components/tooltip';

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
      <span className="w-4 h-4 text-gray-900">
        <OpacityIcon />
      </span>
    </ToolTip>
  );
};

export default OpacityControl;
