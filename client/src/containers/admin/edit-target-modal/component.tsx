import { useMemo, useCallback, FC } from 'react';
import { PlusCircleIcon, XCircleIcon } from '@heroicons/react/solid';

// components
import Modal from 'components/modal';
import Select from 'components/select';
import Button from 'components/button';
import { Input } from 'components/forms';

// containers
import InfoTooltip from 'containers/info-tooltip';

// hooks
import { useFormContext } from 'react-hook-form';

const AdminEditTargetModal: FC = ({ open, onDismiss }) => {
  // const {
  //   // register,
  //   setValue,
  //   watch,
  //   clearErrors,
  //   formState: { errors },
  // } = useFormContext();

  // const handleDropdown = useCallback(
  //   (id: string, value: SelectOption) => {
  //     clearErrors(id);
  //     setValue(id, value?.value);
  //   },
  //   [setValue, clearErrors],
  // );

  const optionsYears = [
    {
      label: '2018',
      value: '2018',
    },
    {
      label: '2019',
      value: '2019',
    },
    {
      label: '2020',
      value: '2020',
    },
    {
      label: '2021',
      value: '2021',
    },
  ];
  return (
    <Modal
      title="Deforestation loss due to land use change"
      open={open}
      onDismiss={onDismiss}
      dismissable
    >
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
            options={optionsYears}
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
      <legend className="flex font-medium leading-5">
        <span className="mr-2.5">Targets</span>
        <InfoTooltip info />
      </legend>
      {/* This should go in a separate component, but not sure where to put it yet, so that is the reason for it to be here */}
      <div className="items-center justify-between rounded-md bg-gray-50 shadow-sm p-4">
        <div className="flex flex-row pb-2 font-semibold text-sm text-gray-500 uppercase">
          <span className="basis-1/6 mr-2.5">Year</span>
          <span className="basis-1/4 mr-2.5">Percentage</span>
          <span className="basis-1/2 mr-2.5">Value</span>
        </div>
        <div className="flex flex-row items-center space-x-4 text-gray-900">
          <Input
            type="text"
            id="year"
            name="year"
            placeholder="2018"
            className="w-full basis-1/6"
            defaultValue=""
            // onInput={handleChange}
          />
          <Input
            type="text"
            id="percentage"
            name="percentage"
            placeholder="0"
            className="w-full basis-1/4"
            defaultValue=""
            // onInput={handleChange}
          />
          <Input
            type="text"
            id="value"
            name="value"
            placeholder="0"
            className="w-full basis-1/2"
            defaultValue=""
            // onInput={handleChange}
          />
          <XCircleIcon className="w-5 h-5 mr-3 fill-gray-400" />
        </div>
      </div>
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
