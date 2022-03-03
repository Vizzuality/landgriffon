import { FC } from 'react';
import Select from 'components/select';

type ScenariosComparison = Readonly<{
  disabled: boolean;
}>;

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

const ScenariosComparison: FC<ScenariosComparison> = ({ disabled }: ScenariosComparison) => (
  <div className="mt-2 space-y-1">
    <Select
      label="Show"
      current={COMPARISON_MODES[0]}
      options={COMPARISON_MODES}
      disabled={disabled}
    />
    <Select label="Relative to" current={TARGETS[0]} options={TARGETS} disabled={disabled} />
  </div>
);

export default ScenariosComparison;
