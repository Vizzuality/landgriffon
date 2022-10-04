import TargetItem from 'containers/targets/item/component';
import type { TargetsListProps } from './types';

const TargetsList: React.FC<TargetsListProps> = ({ data }) => (
  <div className="space-y-2">
    {data.map((target) => (
      <TargetItem key={target.id} {...target} />
    ))}
  </div>
);

export default TargetsList;
