import TargetItem from 'containers/targets/item/component';
import type { TargetsListProps } from './types';

const TargetsList: React.FC<TargetsListProps> = ({ data }) => (
  <div>
    {data.map(({ id, ...target }) => (
      <TargetItem key={id} {...target} />
    ))}
  </div>
);

export default TargetsList;
