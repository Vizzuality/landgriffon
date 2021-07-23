import { Select } from 'antd';

const impactIndicators = [
  // { id: 1, name: 'All impact indicators' },
  { id: 2, name: 'Carbon Emissions (CO2e)' },
  { id: 3, name: 'Deforestation (Ha)' },
  { id: 4, name: 'Unsustainable water use (M3)' },
  { id: 5, name: 'Biodiversity (x)' },
];

// TODO: if !map
impactIndicators.unshift(
  {
    id: 0,
    name: 'All impact indicators',
  }
)

function handleChange(value) {
  console.log(`selected ${value}`);
}

const ImpactIndicatorsFilter = () => {
  return (
    <>
      <Select
        // TODO: if MAP mode=null, if CHART or TABLE mode=multiple
        mode="multiple"
        // allowClear
        // placeholder="Please select"
        defaultValue={impactIndicators[0].id}
        // TODO: onChange
        onChange={handleChange}
        className='w-60'
      >
        {impactIndicators.map((impactIndicator) =>
          <Select.Option
            key={impactIndicator.id}
            value={impactIndicator.id}
          >
            {impactIndicator.name}
          </Select.Option>
        )}
      </Select>
    </>
  );
};

export default ImpactIndicatorsFilter;