import Select from 'components/forms/select';

const COMPARISON_MODES = [
  {
    label: 'Difference (percentage)',
    value: 'percentage',
  },
  {
    label: 'Difference (absolute)',
    value: 'absolute',
  },
  {
    label: 'Values (both values)',
    value: 'both',
  },
];

const TARGETS = [
  {
    label: 'Targets 2025',
    value: 'targets-2025',
  },
];

const ScenariosComparison = () => (
  <div className="mt-2">
    <Select label="Show" current={COMPARISON_MODES[0]} options={COMPARISON_MODES} />
    <Select label="Relative to" current={TARGETS[0]} options={TARGETS} />
  </div>
);

export default ScenariosComparison;
