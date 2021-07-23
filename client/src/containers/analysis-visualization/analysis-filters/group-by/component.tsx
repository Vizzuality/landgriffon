import { Select } from 'antd';

const groups = [
  { id: 1, name: 'Material' },
  { id: 2, name: 'Business Unit' },
  { id: 3, name: 'Region' },
  { id: 4, name: 'Supplier' },
];

function handleChange(value) {
  console.log(`selected ${value}`);
}

const GroupByFilter = () => (
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
