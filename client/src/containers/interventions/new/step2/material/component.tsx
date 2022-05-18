import { useMemo, useCallback } from 'react';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Select from 'components/select';

// containers
import InfoTooltip from 'containers/info-tooltip';

// hooks
import { useMaterials } from 'hooks/materials';
import { useFormContext } from 'react-hook-form';
import { useMetadataInterventionsInfo } from 'hooks/metadata-info';

// types
import type { SelectOption, SelectOptions } from 'components/select/types';

const Material = () => {
  const { data: materials, isLoading: isLoadingMaterials } = useMaterials();
  const optionsMaterials: SelectOptions = useMemo(
    () =>
      materials.map((material) => ({
        label: material.name,
        value: material.id,
      })),
    [materials],
  );

  const {
    register,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const handleDropdown = useCallback(
    (id: string, values: SelectOption) => {
      setValue(id, values.value);
      clearErrors(id);
    },
    [setValue, clearErrors],
  );

  const { material } = useMetadataInterventionsInfo();

  return (
    <form>
      <fieldset className="sm:col-span-3 text-sm">
        <legend className="flex font-medium leading-5">
          <span className="mr-2.5">New material</span>
          <InfoTooltip info={material} />
        </legend>
        <div className="mt-5 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
            <Label className="mb-1">Material</Label>
            <Select
              {...register('newMaterialId')}
              loading={isLoadingMaterials}
              current={optionsMaterials.find((option) => option.value === watch('newMaterialId'))}
              options={optionsMaterials}
              placeholder="Select"
              onChange={(values) => handleDropdown('newMaterialId', values)}
              error={!!errors?.newMaterialId}
              allowEmpty
            />
          </div>

          <div className="block font-medium text-gray-700">
            <Label htmlFor="materialTons" className="mb-1">
              Tons of new material per ton
            </Label>
            <Input
              {...register('materialTons')}
              type="number"
              aria-label="material tons"
              placeholder="0"
              defaultValue={0}
              error={errors?.materialTons}
              showHint={false}
            />
          </div>
        </div>
      </fieldset>
    </form>
  );
};

export default Material;
