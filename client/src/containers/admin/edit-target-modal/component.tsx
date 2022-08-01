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

  const [selectedOption, setSelectedOption] = useState<SelectProps['current']>(null);

  const targetYearsArray: TargetYear[] = useMemo(
    // TO-DO: use indicatorID to filter the target years needed in each case
    () => {
      const findTarget = targets?.find((target) => target.indicatorId === '234').years;
      return findTarget;
    },
    [targets],
  );

  const [targetYears, setTargetYearsValues] = useState<TargetYear[]>(targetYearsArray);

  const yearOptions: SelectProps['options'] = useMemo(
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
      <p className="text-md text-gray-500 mb-8">
        Set up the baseline year and the targets for this indicator.
      </p>
      <legend className="flex font-medium leading-5">
        <span className="mr-2.5">Baseline Year</span>
        <InfoTooltip info />
      </legend>
      <div className="mt-5 pb-4 grid grid-cols-2 gap-y-4 gap-x-6 sm:grid-cols-2">
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
        <div className="block font-medium text-gray-700">
          <div className="bg-green-50 rounded-md py-2 px-6 text-center">
            <div className="text-gray-900 text-base">2.37M tCO2e</div>
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
      {/* <Button theme="primary" icon={PlusCircleIcon} onClick={onDismiss}>
          Add a target
      </Button> */}
      <div className="flex justify-end gap-3 mt-8">
        <Button theme="secondary" onClick={onDismiss}>
          Cancel
        </Button>
        <Button theme="primary" onClick={onDismiss}>
          Save
        </Button>
      </div>
    </Modal>
  );
};

export default AdminEditTargetModal;
