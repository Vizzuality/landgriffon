import { useCallback, useMemo } from 'react';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';

//import { analysis, setFilter } from 'store/features/analysis';

// components
import Select from 'components/select';
import Label from 'components/forms/label';
import Textarea from 'components/forms/textarea';

// types
import { SelectOptions, SelectOption } from 'components/select/types';

const GowthForm = () => {
  const dispatch = useAppDispatch();
  //const [isOpen, setIsOpen] = useState<boolean>(false);
  //const { filters } = useAppSelector(analysis);

  const onChange = useCallback((key: string, value: string | number) => {
    console.log(key, value);
  }, []);
  const businessUnities = ['business1', 'business2', 'business3'];
  const growthRates = ['growth1', 'growth2', 'growth3'];

  // const { data: materials, isLoading: isLoadingMaterials } = useMaterials();
  // const { data: businesses, isLoading: isLoadingBusinesses } = useBusinesses();
  // const { data: supliers, isLoading: isLoadingSupliers } = useSupliers();
  // const { data: sourcingRegions, isLoading: isLoadingSourcingRegions } = useSourcingRegions();

  const businessUnity = 'business1';
  const growthRate = 'growth3';
  const isLoadingBusinessUnity = false;
  const isLoadingGrowth = false;

  const optionsBusiness: SelectOptions = useMemo(
    () =>
      businessUnities.map((business) => ({
        label: business,
        value: business,
      })),
    [businessUnities],
  );

  const currentBusinessUnity = useMemo<SelectOption>(
    () => optionsBusiness?.find((option) => option.value === businessUnity),
    [optionsBusiness],
  );

  const optionsGrowth: SelectOptions = useMemo(
    () =>
      growthRates.map((business) => ({
        label: business,
        value: business,
      })),
    [growthRates],
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
        <Label>Business unity</Label>
        <Select
          loading={isLoadingBusinessUnity}
          current={currentBusinessUnity}
          options={optionsBusiness}
          placeholder="Select"
          onChange={() => onChange('business_unity', currentBusinessUnity.value)}
        />
        <Label>Growth rate (Linear)</Label>
        <Select
          loading={isLoadingGrowth}
          current={currentGrowth}
          options={optionsGrowth}
          placeholder="Select"
          onChange={() => onChange('growth', currentGrowth.value)}
        />
      </fieldset>
    </>
  );
};

export default GowthForm;
