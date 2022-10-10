import { useMemo, useState, useCallback } from 'react';

import { useSourcingRecordsYears } from 'hooks/sourcing-records';
import { useTargets } from 'hooks/targets';

import TargetInputList from 'containers/targets/input-list';

import InfoTooltip from 'components/info-tooltip';
import Modal from 'components/modal';
import Select from 'components/select';
import Button from 'components/button';

import type { TargetYear } from 'types';
import type { ModalProps } from 'components/modal';
import type { SelectProps } from 'components/select';

type EditTargetModalProps = ModalProps;

const AdminEditTargetModal: React.FC<EditTargetModalProps> = ({ title, open, onDismiss }) => {
  const { data, isLoading } = useSourcingRecordsYears();
  const { data: targets } = useTargets();

  const [selectedOption, setSelectedOption] = useState<SelectProps<number>['current']>(null);

  const targetYearsArray: TargetYear[] = useMemo(
    // TO-DO: use indicatorID to filter the target years needed in each case
    () => {
      const findTarget = targets?.find((target) => target.indicatorId === '234').years;
      return findTarget;
    },
    [targets],
  );

  const [targetYears, setTargetYearsValues] = useState<TargetYear[]>(targetYearsArray);

  const yearOptions: SelectProps<number>['options'] = useMemo(
    () =>
      data?.map((year) => ({
        label: year.toString(),
        value: year,
      })),
    [data],
  );

  const handleDropdown = useCallback((option) => {
    setSelectedOption(option);
  }, []);

  const handleOnChangeTarget = useCallback(
    (year, target) => {
      const baseline = 2370000;
      const isPercentage = target.id === 'percentage';
      const isValue = target.id === 'value';
      const updatedTargets = targetYears.map((target) => {
        if (year === target.year && isPercentage) {
          const targetCalculation = (target.value * baseline) / 100;
          return { ...target, value: targetCalculation };
        } else if (year == target.year && isValue) {
          const percentageCalculation = (target.value * 100) / baseline;
          return { ...target, percentage: percentageCalculation };
        }
        return target;
      });
      return setTargetYearsValues(updatedTargets);
    },
    [targetYears],
  );

  return (
    <Modal title={title} open={open} onDismiss={onDismiss} dismissable>
      <p className="mb-8 text-gray-500 text-md">
        Set up the baseline year and the targets for this indicator.
      </p>
      <legend className="flex font-medium leading-5">
        <span className="mr-2.5">Baseline Year</span>
        <InfoTooltip info />
      </legend>
      <div className="grid grid-cols-2 pb-4 mt-5 gap-y-4 gap-x-6 sm:grid-cols-2">
        <div className="block font-medium text-gray-900">
          <Select
            numeric
            hideValueWhenMenuOpen
            loading={isLoading}
            current={selectedOption}
            options={yearOptions}
            placeholder="Select a year"
            onChange={handleDropdown}
            // error={!!errors?.newYearID}
          />
        </div>
        <div className="block font-medium text-gray-600">
          <div className="px-6 py-2 text-center rounded-md bg-green-50">
            <div className="text-base text-gray-900">2.37M tCO2e</div>
          </div>
        </div>
      </div>
      <legend className="flex pb-2 font-medium leading-5">
        <span className="mr-2.5">Targets</span>
        <InfoTooltip info />
      </legend>
      <TargetInputList
        data={targetYears}
        // percentageValue={}
        onChange={handleOnChangeTarget}
      />
      {/* <Button variant="primary" icon={PlusCircleIcon} onClick={onDismiss}>
          Add a target
      </Button> */}
      <div className="flex justify-end gap-3 mt-8">
        <Button variant="secondary" onClick={onDismiss}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onDismiss}>
          Save
        </Button>
      </div>
    </Modal>
  );
};

export default AdminEditTargetModal;
