import type { ReactNode } from 'react';

const BreakdownItem = ({
  name,
  color,
  icon,
  value,
}: {
  name: string;
  color: string;
  icon: ReactNode;
  value: number;
}): JSX.Element => {
  return (
    <div className="flex items-center justify-between space-x-6 py-3 after:ml-6 after:w-[98px]">
      <div className="flex flex-1 items-center space-x-4">
        {icon ?? null}
        <span>{name}</span>
      </div>
      <div className="shrink-0 grow-0">
        <div className="text-center">
          {`${value}%`} <span className="text-2xs">of suppliers</span>
        </div>
        <div className="h-[2px] w-[340px] bg-gray-200">
          <div className="h-[2px]" style={{ width: `${value}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
};

export default BreakdownItem;
