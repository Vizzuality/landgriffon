import { Select } from 'antd';
import { ChevronDownIcon } from '@heroicons/react/solid';

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
      optionLabelProp="label"
      suffixIcon={<ChevronDownIcon />}
    >
      {groups.map((group) => (
        <Select.Option
          key={group.id}
          value={group.id}
          label={
            <>
              <span className="text-gray-500">by</span> {group.name}
            </>
          }
        >
          {group.name}
        </Select.Option>
      ))}
    </Select>
  </>
);

export default GroupByFilter;
