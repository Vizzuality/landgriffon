import { useMemo, useCallback, useState, FC } from 'react';

// components
import Checkbox from 'components/forms/checkbox';
import Input from 'components/forms/input';
import Label from 'components/forms/label';

// types
import { setFilter } from 'store/features/analysis';

// containers
import InfoTooltip from 'containers/info-tooltip';

// utils
import { NUMBER_FORMAT } from 'containers/analysis-visualization/constants';

interface Indicator {
  name: string;
  value: number;
  description: string;
  id: string;
  metadata: unknown;
  unit: string;
}

const Step2: FC = () => {
  const [landgriffonEstimates, setLandgriffonEstimates] = useState(false);
  // const { data: indicators, isFetching, isFetched, error } = useIndicators();

  const data = useMemo<Indicator[]>(
    () => [
      {
        description:
          'The different terrestrial ecosystems play an important role storing carbon on the below-ground plant organic matter and soil. Particularly forest, through growth of trees and the increase of soil carbon, contain a large part of the carbon stored on land.\n\nActivities such us land use change or deforestation may affect carbon storage producing a disturbance of the carbon pools that may be released into the atmosphere.\n\nCarbon emissions due to land use change would therefore be the release of carbon into the atmosphere driven by the change from forest into a specific agriculture commodity.',
        id: 'c71eb531-2c8e-40d2-ae49-1049543be4d1',
        metadata: {},
        name: 'Carbon emissions',
        value: 0,
        unit: 'tCO2e',
      },
      {
        description: 'Deforestation risk due to ...',
        id: '',
        metadata: {},
        name: 'Deforestation risk',
        value: 0,
        unit: 'Ha',
      },
      {
        description: 'With the Unsustainable water use indicator...',
        id: 'e2c00251-fe31-4330-8c38-604535d795dc',
        metadata: {},
        name: 'Water withdrawal',
        value: 0,
        unit: '100m3',
      },
      {
        description: 'Land use and land use change...',
        id: '0594aba7-70a5-460c-9b58-fc1802d264ea',
        metadata: {},
        name: 'Biodiversity impact',
        value: 0,
        unit: 'X',
      },
    ],
    [],
  );

  const handleChange = useCallback((key: string, value: number) => {
    setFilter({
      id: key,
      value: NUMBER_FORMAT(value),
    });
  }, []);

  const indicatorsValues = () =>
    data.reduce(
      (obj, indicator) => ({
        ...obj,
        [indicator.name]: indicator.value,
      }),
      {},
    );

  return (
    <>
      <fieldset className="sm:col-span-3 text-sm">
        <legend className="flex font-medium leading-5">
          Supplier impacts per tone
          <InfoTooltip className="ml-2" />
        </legend>
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center">
            <Checkbox
              id="landgriffon_estimates"
              name="landgriffon_estimates"
              onChange={() => setLandgriffonEstimates(!landgriffonEstimates)}
            />
            <Label htmlFor="landgriffon_estimates" className="ml-2">
              Use LandGriffon location-based estimates.
            </Label>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-6 sm:grid-cols-2">
          {data.map((indicator) => (
            <Label htmlFor={indicator.name} key={indicator.id}>
              {indicator.name}
              <div className="mt-1 relative">
                <Input
                  className="w-full"
                  type="number"
                  name={indicator.name}
                  id={indicator.name}
                  unit={indicator.unit}
                  defaultValue={landgriffonEstimates ? indicator.value : ''}
                  value={landgriffonEstimates ? indicator.value : indicatorsValues[indicator.name]}
                  disabled={landgriffonEstimates}
                  onChange={(e) => handleChange(indicator.name, Number(e?.target?.value))}
                />
              </div>
            </Label>
          ))}
        </div>
      </fieldset>
    </>
  );
};

export default Step2;
