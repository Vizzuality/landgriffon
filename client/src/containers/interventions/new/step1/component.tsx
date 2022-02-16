import { useCallback, useMemo } from 'react';

// hooks
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { useRouter } from 'next/router';

import { analysis, setFilter } from 'store/features/analysis';

// components
import Select from 'components/select';

// types
import { SelectOptions, SelectOption } from 'components/select/types';

const Step1 = () => {
  const dispatch = useAppDispatch();
  //const [isOpen, setIsOpen] = useState<boolean>(false);
  const { filters } = useAppSelector(analysis);
  const { materials: materialsData } = filters;
  const router = useRouter();
  const { query } = router;

  const materials = ['material1', 'material2', 'material3'];
  const businesses = ['business1', 'business2', 'business3'];
  const supliers = ['supplier1', 'supplier2', 'supplier3'];
  const sourcingRegions = ['sourcingRegion1', 'sourcingRegion2', 'sourcingRegion3'];
  const yearCompletions = [2001, 2015, 2020];
  const interventionTypes = [
    'Source from a new supplier or location',
    'Change production efficiency',
    'Switch to a new material',
  ];

  // const { data: materials, isLoading: isLoadingMaterials } = useMaterials();
  // const { data: businesses, isLoading: isLoadingBusinesses } = useBusinesses();
  // const { data: supliers, isLoading: isLoadingSupliers } = useSupliers();
  // const { data: sourcingRegions, isLoading: isLoadingSourcingRegions } = useSourcingRegions();

  const material = 'material1';
  const business = 'business2';
  const suplier = 'supplier2';
  const sourcingRegion = 'sourcingRegion3';
  const yearCompletion = 2015;
  const interventionType = '';

  const optionsMaterial: SelectOptions = useMemo(
    () =>
      materials.map((material) => ({
        label: material,
        value: material,
      })),
    [materials],
  );

  const currentMaterial = useMemo<SelectOption>(
    () => optionsMaterial?.find((option) => option.value === material),
    [optionsMaterial],
  );

  const optionsBusinesses: SelectOptions = useMemo(
    () =>
      businesses.map((business) => ({
        label: business,
        value: business,
      })),
    [businesses],
  );

  const currentBusiness = useMemo<SelectOption>(
    () => optionsBusinesses?.find((option) => option.value === business),
    [optionsBusinesses],
  );

  const optionsSuplier: SelectOptions = useMemo(
    () =>
      supliers.map((suplier) => ({
        label: suplier,
        value: suplier,
      })),
    [supliers],
  );

  const currentSuplier = useMemo<SelectOption>(
    () => optionsSuplier?.find((option) => option.value === suplier),
    [optionsSuplier],
  );

  const optionsSourcingRegion: SelectOptions = useMemo(
    () =>
      sourcingRegions.map((sourcingRegion) => ({
        label: sourcingRegion,
        value: sourcingRegion,
      })),
    [sourcingRegions],
  );

  const currentsourcingRegion = useMemo<SelectOption>(
    () => optionsSourcingRegion?.find((option) => option.value === sourcingRegion),
    [optionsSourcingRegion],
  );

  const optionsYearCompletion: SelectOptions = useMemo(
    () =>
      yearCompletions.map((YearCompletion) => ({
        label: YearCompletion.toString(),
        value: YearCompletion,
      })),
    [yearCompletions],
  );

  const currentYearCompletion = useMemo<SelectOption>(
    () => optionsYearCompletion?.find((option) => option.value === yearCompletion),
    [optionsYearCompletion],
  );

  const optionsInterventionType: SelectOptions = useMemo(
    () =>
      interventionTypes.map((InterventionType) => ({
        label: InterventionType,
        value: InterventionType,
      })),
    [interventionTypes],
  );

  const currentInterventionType = useMemo<SelectOption>(
    () => optionsInterventionType?.find((option) => option.value === interventionType),
    [optionsInterventionType],
  );

  const isLoadingMaterials = false;
  const isLoadingBusinesses = false;
  const isLoadingSupliers = false;
  const isLoadingSourcingRegions = false;
  const isLoadingYearCompletion = false;
  const isLoadingInterventionTypes = false;

  const onChange = useCallback((key: string, value: string | number) => {
    if (key === 'intervention_type') {
      // router.push({
      //   pathname: '/analysis',
      //   query: {
      //     ...query,
      //     intervention_type: value, // by default firs option of the list
      //   },
      // });
    }
  }, []);
  
  return (
    <>
      <fieldset className="sm:col-span-3 text-sm">
        <div className="mt-6">
          <label
            htmlFor="intervention_description"
            className="block text-sm font-medium text-gray-700"
          >
            Intervention description <span className="text-gray-600">(optional)</span>
          </label>
          <div className="mt-1">
            <textarea
              id="ntervention_description"
              name="ntervention_description"
              rows={3}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
              defaultValue=""
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-1 flex flex-col">
        <p className="font-medium leading-5 text-sm">Apply intervention to:</p>
        <div className="flex items-center text-green-700">
          <input
            type="number"
            name="percentage"
            id="percentage"
            min={0}
            max={100}
            aria-label="percentage"
            placeholder="100"
            className="border-none mr-1 will-change-contents text-green-700"
          />
          <span className="text-green-700 font-bold pr-2">%</span>

          <span className="text-gray-700 font-medium pr-2">of</span>
          <div className="font-bold">
            <Select
              loading={isLoadingMaterials}
              current={currentMaterial}
              options={optionsMaterial}
              placeholder="all materials"
              onChange={() => onChange('materials', currentMaterial.value)}
              theme="secondary"
            />
          </div>
          <span className="text-gray-700 font-medium pr-2">for</span>
          <Select
            loading={isLoadingBusinesses}
            current={currentBusiness}
            options={optionsBusinesses}
            placeholder="all businesses"
            onChange={() => onChange('businesses', currentBusiness.value)}
            theme="secondary"
          />
          <span className="text-gray-700 font-medium pr-2">from</span>
          <Select
            loading={isLoadingSupliers}
            current={currentSuplier}
            options={optionsSuplier}
            placeholder="all supliers"
            onChange={() => onChange('supliers', currentSuplier.value)}
            theme="secondary"
          />
          <span className="text-gray-700 font-medium pr-2">in</span>
          <Select
            loading={isLoadingSourcingRegions}
            current={currentsourcingRegion}
            options={optionsSourcingRegion}
            placeholder="all sourcing regions"
            onChange={() => onChange('sourcing_regions', currentsourcingRegion.value)}
            theme="secondary"
          />
          <span className="text-gray-700 font-medium pr-2">.</span>
        </div>
      </fieldset>
      <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
        <div className="text-sm font-medium text-gray-700">
          <span>Year of completion</span>
          <div className="mt-1">
            <Select
              loading={isLoadingYearCompletion}
              current={currentYearCompletion}
              options={optionsYearCompletion}
              placeholder="Select"
              onChange={() => onChange('year_completion', currentYearCompletion.value)}
            />
          </div>
        </div>

        <div className="text-sm font-medium text-gray-700">
          <span>Type of intervention</span>
          <div className="mt-1">
            <Select
              loading={isLoadingInterventionTypes}
              current={currentInterventionType}
              options={optionsInterventionType}
              placeholder="Select"
              onChange={() => onChange('intervention_type', currentInterventionType?.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Step1;
