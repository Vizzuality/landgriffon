import { Select } from 'antd';

import type { Group } from 'types';

type GroupByFilterProps = {
  groups: Group[];
};

function handleChange(value) {
  console.log(`selected ${value}`);
}

const GroupByFilter: React.FC<GroupByFilterProps> = ({ groups }: GroupByFilterProps) => (
  <>
    <Select
      defaultValue={groups[0].id}
      // TODO: onChange
      onChange={handleChange}
      className="w-40"
    >
      {groups.map((group) => (
        <Select.Option key={group.id} value={group.id}>
          {/* TODO: add 'by' before */}
          {group.name}
        </Select.Option>
      ))}
    </Select>
  </>
);

export default GroupByFilter;
