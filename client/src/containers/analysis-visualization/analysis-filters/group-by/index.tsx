import type { Group } from 'types';
import Component from './component';

const ALL_GROUPS: Group[] = [
  {
    id: 'material',
    name: 'Material',
  },
  {
    id: 'business-unit',
    name: 'Business Unit',
  },
  {
    id: 'region',
    name: 'Region',
  },
  {
    id: 'supplier',
    name: 'Supplier',
  },
];

const GroupByFilterContainer: React.FC = () => <Component groups={ALL_GROUPS} />;

export default GroupByFilterContainer;
