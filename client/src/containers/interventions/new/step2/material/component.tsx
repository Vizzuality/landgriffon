import { useMemo, useCallback } from 'react';

// components
import Input from 'components/forms/input';
import Label from 'components/forms/label';
import Select from 'components/select';

// containers
import InfoTooltip from 'containers/info-tooltip';

// hooks
import { useMaterials } from 'hooks/materials';

// types
import { SelectOptions, SelectOption } from 'components/select/types';

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

  const currentMaterial = useMemo<SelectOption>(
    () => optionsMaterials?.find((option) => option.value === 'formData.material'),
    [optionsMaterials],
  );

  const onChange = useCallback((key: string, value: string | number) => {
    console.log('onChange filter');
  }, []);

  return (
    <form>
      <fieldset className="sm:col-span-3 text-sm mt-8">
        <legend className="font-medium leading-5">
          New material
          <InfoTooltip className="ml-2" />
        </legend>
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          <div className="block font-medium text-gray-700">
            <Label className="mb-1">Material</Label>
            <Select
              loading={isLoadingMaterials}
              current={currentMaterial}
              options={optionsMaterials}
              placeholder="Select"
            />
          </div>

          <div className="block font-medium text-gray-700">
            <Label htmlFor="materialTons" className="mb-1">
              Tons of new material per ton
            </Label>
            <Input
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
