import { InformationCircleIcon } from '@heroicons/react/outline';

export type LegendItemProps = {
  id: string;
  name: string;
  unit: string;
  description?: string;
  children?: React.ReactNode;
};

export const LegendItem: React.FC<LegendItemProps> = ({
  id,
  name,
  unit,
  children,
}: LegendItemProps) => (
  <div key={id} className="p-4">
    {name && (
      <div className="flex text-sm text-gray-500 font-heading mb-4">
        <div className="flex-1 flex items-start justify-between">
          <div className="text-sm text-gray-500">{name}</div>
          <div className="flex items-center">
            <div className="flex-1 flex items-center space-x-1 mt-0.5">
              <button>
                <InformationCircleIcon className="w-4 h-4 text-gray-900" />
              </button>
              <button>
                <InformationCircleIcon className="w-4 h-4 text-gray-900" />
              </button>
            </div>
          </div>
        </div>
        <div className="ml-1 w-8" />
      </div>
    )}
    <div className="flex">
      {children}
      <div className="w-8 text-xs text-gray-500 -m-1">{unit}</div>
    </div>
  </div>
);

export default LegendItem;
