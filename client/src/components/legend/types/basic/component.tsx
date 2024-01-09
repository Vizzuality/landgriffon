import type { Legend } from 'types';

export interface LegendTypeBasicProps {
  className?: string;
  items: Legend['items'];
}

export const LegendTypeBasic: React.FC<LegendTypeBasicProps> = ({ className, items }) => (
  <div className={className}>
    <ul className="flex w-full flex-col space-y-1">
      {items.map(({ label, color }) => (
        <li key={label} className="flex space-x-2 text-xs">
          <div
            className="mt-0.5 h-3 w-3 flex-shrink-0 rounded"
            style={{
              backgroundColor: color,
            }}
          />
          <div>{label}</div>
        </li>
      ))}
    </ul>
  </div>
);

export default LegendTypeBasic;
