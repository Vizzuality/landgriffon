import { useMemo, useState, FC, useEffect } from 'react';
import { range } from 'lodash';

// components
import Modal from 'components/modal';
import Select, { SelectProps } from 'components/select';
import Button from 'components/button';

// containers
import InfoTooltip from 'containers/info-tooltip';
import TargetInputList from 'containers/targets/input-list';

// hooks
import { useSourcingRecordsYears } from 'hooks/sourcing-records';

const AdminEditTargetModal: FC = ({ title, open, onDismiss }) => {
  // const {
  //   // register,
  //   setValue,
  //   watch,
  //   clearErrors,
  //   formState: { errors },
  // } = useFormContext();

  const { data } = useSourcingRecordsYears();

  const [selectedOption, setSelectedOption] = useState<SelectProps['current']>(null);


  // const handleDropdown = useCallback(
  //   (id: string, value: SelectOption) => {
  //     clearErrors(id);
  //     setValue(id, value?.value);
  //   },
  //   [setValue, clearErrors],
  // );

  const yearOptions: SelectProps['options'] = useMemo(
    () =>
      data?.map((year) => ({
        label: year.toString(),
        value: year,
      })),
    [data],
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
            // {...register('newYearID')}
            // current={optionsYears.find((option) => option.value === watch('newYearID'))}
            options={yearOptions}
            placeholder="Select"
            // onChange={(value) => handleDropdown('newProducerId', value)}
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
      <TargetInputList />
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
