import { useMemo, useCallback, FC } from 'react';

// components
import Modal from 'components/modal';
import Select from 'components/select';
import Button from 'components/button';
import Textarea from 'components/forms/textarea';

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
      <p className="text-md text-gray-500 mb-8">This is a subtitle</p>
      <legend className="flex font-medium leading-5">
        <span className="mr-2.5">Baseline Year</span>
        <InfoTooltip info />
      </legend>
      <div className="mt-5 grid grid-cols-2 gap-y-4 gap-x-6 sm:grid-cols-2">
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
          <div className="bg-green-50 rounded-md py-3 px-6 text-center">
            <div className="text-gray-900 text-base">2.37M tCO2e</div>
          </div>
        </div>
      </div>
      <legend className="flex font-medium leading-5">
        <span className="mr-2.5">Targets</span>
        <InfoTooltip info />
      </legend>
      {/* This should go in a separate component, but not sure where to put it yet, so that is the reason for it to be here */}
      <div className="grid grid-cols-4 gap-4 items-center justify-between rounded-md bg-gray-50 shadow-sm p-4">
        <div className="text-xs text-gray-500 uppercase">
          <span className="mr-2.5">Year</span>
          <span className="mr-2.5">Percentage</span>
          <span className="mr-2.5">Value</span>
        </div>
        <div className="text-gray-900">
          <Textarea
            id="year"
            name="year"
            rows={1}
            className="w-full"
            // defaultValue={description}
            // onInput={handleChange}
          />
        </div>
      </div>
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
