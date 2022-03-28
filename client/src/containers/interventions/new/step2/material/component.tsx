import { useMemo, useState } from 'react';

// hooks
import { useMaterials } from 'hooks/materials';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Select from 'components/select';

// form validation
import { useFormContext } from 'react-hook-form';

// types
import { SelectOption, SelectOptions } from 'components/select/types';

const Material = () => {
  const { data: materials, isLoading: isLoadingMaterials } = useMaterials();

  const [formData, setFormData] = useState({
    material: materials[0]?.id,
  });

  const optionsMaterials: SelectOptions = useMemo(
    () =>
      materials.map((material) => ({
        label: material.name,
        value: material.id,
      })),
    [materials],
  );

  const currentMaterial = useMemo<SelectOption>(
    () => optionsMaterials?.find((option) => option.value === formData.material),
    [optionsMaterials, formData.material],
  );

  const { register, setValue } = useFormContext();

  return (
    <form>
      <fieldset className="sm:col-span-3 text-sm mt-8">
        <legend className="font-medium leading-5">New material</legend>

        <div className="mt-4 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
            <Label className="mb-1">Material</Label>

            <Select
              {...register('newMaterialId')}
              loading={isLoadingMaterials}
              current={currentMaterial}
              options={optionsMaterials}
              placeholder="Select"
              onChange={({ value }) => setValue('newMaterialId', value)}
            />
          </div>

          <div className="block font-medium text-gray-700">
            <Label htmlFor="materialTons" className="mb-1">
              Tons of new material per ton
            </Label>
            <Input
              {...register('newMaterialTonnageRatio')}
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
