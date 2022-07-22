import type { FC } from 'react';
import { useCallback, useMemo } from 'react';

// hooks
// import { useAppDispatch, useAppSelector } from 'store/hooks';

//import { analysis, setFilter } from 'store/features/analysis';

// components
import Select from 'components/select';
import Label from 'components/forms/label';
import Textarea from 'components/forms/textarea';

// types
import type { SelectOptions, SelectOption } from 'components/select/types';
import { useBusinessUnits } from 'hooks/business-units';

const growthRates = ['growth1', 'growth2', 'growth3'];
const businessUnity = 'business1';
const growthRate = 'growth3';
const isLoadingGrowth = false;

const GowthForm: FC = () => {
  //const dispatch = useAppDispatch();
  //const [isOpen, setIsOpen] = useState<boolean>(false);
  //const { filters } = useAppSelector(analysis);

  const onChange = useCallback((key: string, value: string | number) => {
    console.log(key, value);
  }, []);

  // const { data: materials, isLoading: isLoadingMaterials } = useMaterials();
  const { data: businesses, isLoading: isLoadingBusinesses } = useBusinessUnits();
  // const { data: supliers, isLoading: isLoadingSupliers } = useSupliers();
  // const { data: sourcingRegions, isLoading: isLoadingSourcingRegions } = useSourcingRegions();

  const optionsBusinesses: SelectOptions = useMemo(
    () =>
      businesses.map(({ name, id }) => ({
        label: name,
        value: id,
      })),
    [businesses],
  );

  const currentBusinessUnity = useMemo<SelectOption>(
    () => optionsBusinesses?.find((option) => option.value === businessUnity),
    [optionsBusinesses],
  );

  const optionsGrowth: SelectOptions = useMemo(
    () =>
      growthRates.map((business) => ({
        label: business,
        value: business,
      })),
    [],
  );

  const currentGrowth = useMemo<SelectOption>(
    () => optionsGrowth?.find((option) => option.value === growthRate),
    [optionsGrowth],
  );

  return (
    <>
      <h2 className="text-xl">Set growth rate</h2>
      <p className="text-sm text-gray-600">
        Growth rates set your expectations of how purchaces of raw materials will change into the{' '}
        future. More specific settings override less specific ones.
      </p>
      <fieldset className="sm:col-span-3 text-sm">
        <div className="mt-6">
          <Label htmlFor="business">
            Growth description <span className="text-gray-600">(optional)</span>
          </Label>
          <Textarea id="business" name="business" rows={3} className="w-full" defaultValue="" />
        </div>
      </fieldset>

      <fieldset className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2 text-sm font-medium text-gray-700">
        <div className="space-y-1">
          <Label>Business unit</Label>
          <Select
            loading={isLoadingBusinesses}
            current={currentBusinessUnity}
            options={optionsBusinesses}
            placeholder="Select"
            onChange={() => onChange('business_unity', currentBusinessUnity.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Growth rate (Linear)</Label>
          <Select
            loading={isLoadingGrowth}
            current={currentGrowth}
            options={optionsGrowth}
            placeholder="Select"
            onChange={() => onChange('growth', currentGrowth.value)}
          />
        </div>
      </fieldset>
    </>
  );
};

export default GowthForm;
