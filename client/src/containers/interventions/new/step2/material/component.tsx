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

// types
import { SelectOptions, SelectOption } from 'components/select/types';
import { watch } from 'fs';

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

  const { register, setValue, watch } = useFormContext();

  const handleDropdown = useCallback(
    (id: string, value: string | string[] | number) => {
      setValue(id, value);
    },
    [setValue],
  );

  return (
    <form>
      <fieldset className="sm:col-span-3 text-sm">
        <legend className="font-medium leading-5 mt-8">
          New material
          <InfoTooltip className="ml-2" />
        </legend>
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
            <Label className="mb-1">Material</Label>
            <Select
              {...register('newMaterialId')}
              loading={isLoadingMaterials}
              current={watch('newMaterialId')}
              options={optionsMaterials}
              placeholder="Select"
              onChange={({ value }) => handleDropdown('newMaterialId', value)}
            />
          </div>

          <div className="block font-medium text-gray-700">
            <Label htmlFor="materialTons" className="mb-1">
              Tons of new material per ton
            </Label>
            <Input
              {...register('materialTons')}
              type="number"
              name="materialTons"
              id="materialTons"
              aria-label="material tons"
              placeholder="0"
              defaultValue={0}
            />
          </div>
        </div>
      </fieldset>
    </form>
  );
};

export default Material;
