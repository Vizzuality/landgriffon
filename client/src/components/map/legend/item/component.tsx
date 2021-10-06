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
  description,
  children,
}: LegendItemProps) => (
  <div key={id} className="p-4">
    {name && (
      <div className="text-sm text-black font-heading mb-4">
        {name} {unit && `(${unit})`}
      </div>
    )}

    {description && <div className="text-sm text-gray-300 mb-2">{description}</div>}

    {children}
  </div>
);

export default LegendItem;
