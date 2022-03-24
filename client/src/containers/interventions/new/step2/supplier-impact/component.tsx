import { useMemo, useState, FC } from 'react';

// components
import Checkbox from 'components/forms/checkbox';
import Input from 'components/forms/input';
import Label from 'components/forms/label';

// containers
import InfoTooltip from 'containers/info-tooltip';

// form validation
import { useFormContext } from 'react-hook-form';

interface Indicator {
  name: string;
  value: number;
  description: string;
  id: string;
  metadata: unknown;
  unit: string;
}

const SuppliersImpact: FC = () => {
  const [landgriffonEstimates, setLandgriffonEstimates] = useState(false);
  // const { data: indicators, isFetching, isFetched, error } = useIndicators();

  // "newIndicatorCoefficients": {
  //   "DF_LUC_T": 0,
  //   "UWU_T": 0,
  //   "BL_LUC_T": 0,
  //   "GHG_LUC_T": 0
  // },
  const indicators = useMemo<Indicator[]>(
    () => [
      {
        description:
          'The different terrestrial ecosystems play an important role storing carbon on the below-ground plant organic matter and soil. Particularly forest, through growth of trees and the increase of soil carbon, contain a large part of the carbon stored on land.\n\nActivities such us land use change or deforestation may affect carbon storage producing a disturbance of the carbon pools that may be released into the atmosphere.\n\nCarbon emissions due to land use change would therefore be the release of carbon into the atmosphere driven by the change from forest into a specific agriculture commodity.',
        // id: 'c71eb531-2c8e-40d2-ae49-1049543be4d1',
        metadata: {},
        name: 'Carbon emissions',
        id: 'carbonEmissions',
        value: 0,
        unit: 'tCO2e',
      },
      {
        description: 'Deforestation risk due to ...',
        id: 'deforestationRisk',
        metadata: {},
        name: 'Deforestation risk',
        value: 0,
        unit: 'Ha',
      },
      {
        description: 'With the Unsustainable water use indicator...',
        // id: 'e2c00251-fe31-4330-8c38-604535d795dc',
        id: 'waterWithdrawal',
        metadata: {},
        name: 'Water withdrawal',
        value: 0,
        unit: '100m3',
      },
      {
        description: 'Land use and land use change...',
        // id: '0594aba7-70a5-460c-9b58-fc1802d264ea',
        id: 'biodiversityImpact',
        metadata: {},
        name: 'Biodiversity impact',
        value: 0,
        unit: 'X',
      },
    ],
    [],
  );

  const indicatorsValues = () =>
    indicators.reduce(
      (obj, indicator) => ({
        ...obj,
        [indicator.name]: indicator.value,
      }),
      {},
    );

  const { register } = useFormContext();

  return (
    <form>
      <fieldset className="sm:col-span-3 text-sm mt-8">
        <legend className="flex font-medium leading-5">
          Supplier impacts per tone
          <InfoTooltip className="ml-2" />
        </legend>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <Checkbox
              id="landgriffon_estimates"
              name="landgriffon_estimates"
              onChange={() => setLandgriffonEstimates(!landgriffonEstimates)}
            />
            <Label htmlFor="landgriffon_estimates" className="ml-2 mt-1">
              Use LandGriffon location-based estimates.
            </Label>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          {indicators.map((indicator) => (
            <div key={indicator.name}>
              <Label htmlFor={indicator.name} key={indicator.id}>
                {indicator.name}
              </Label>
              <Input
                {...register(indicator.id)}
                id={indicator.id}
                type="number"
                name={indicator.name}
                unit={indicator.unit}
                defaultValue={!!landgriffonEstimates ? indicator.value : 0}
                value={!!landgriffonEstimates ? indicator.value : indicatorsValues[indicator.name]}
                disabled={!!landgriffonEstimates}
              />
            </div>
          ))}
        </div>
      </fieldset>
    </form>
  );
};

export default SuppliersImpact;
