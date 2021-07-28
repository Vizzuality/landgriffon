import type { Group } from 'types';
import Component from './component';

const ALL_GROUPS: Group[] = [
  {
    id: '0',
    name: 'Material',
  },
  {
    id: '1',
    name: 'Business Unit',
  },
  {
    id: '2',
    name: 'Region',
  },
  {
    id: '3',
    name: 'Supplier',
  },
];

const GroupByFilterContainer: React.FC = () => <Component groups={ALL_GROUPS} />;

export default GroupByFilterContainer;
