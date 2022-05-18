import { useCallback } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';

import LegendItem from 'components/legend/item';
import LegendTypeChoropleth from 'components/legend/types/choropleth';
import { analysisFilters } from 'store/features/analysis';

// TODO: if this name changes the legend will break. Same with using the iD. So add a Cypress test just in case
const IMPACT_TOOLTIP_INFO = {
  'Biodiversity loss due to land use change':
    "Biodiversity loss due to land use change (PDF) measures the regional species loss, displacement or reduction of species that would otherwise exist in the land if it wouldn't be used for production of certain commodities.",
  'Deforestation loss due to land use change':
    'Forest loss due to land use change (ha) measures the conversion of forest to other land use that has been likely produced due to the presence of nearby commodity driven agriculture, independent whether human induced or not.',
  'Carbon emissions due to land use change':
    ' Carbon emissions due to land use change (tCO2e) measures the release of biomass carbon associated with the forest that were lost near to a corpland area for a specific agricultural commodity.',
  'Unsustainable water use':
    'Blue water footprint or water consumption indicator (m3) measures directly and indirectly the appropriation of freshwater resources. The Blue Water Footprint includes the water that has been sourced from surface or groundwater resources and is either evaporated, incorporated into a product or taken from one body of water and returned to another, or returned at a different time.',
};

const ImpactLayer = () => {
  const dispatch = useAppDispatch();
  const {
    layers: { impact },
  } = useAppSelector(analysisMap);

  const handleOpacity = useCallback(
    (opacity: number) => {
      dispatch(setLayer({ id: 'impact', layer: { opacity } }));
    },
    [dispatch],
  );
  const legendIndicator = useAppSelector(analysisFilters).indicator.label;

  // TO-DO: add Loading component
  return (
    <LegendItem
      name={impact.legend.name}
      unit={impact.legend.unit}
      opacity={impact.opacity}
      active={impact.active}
      onChangeOpacity={handleOpacity}
      showToggle={false}
      isLoading={impact.loading}
      legendInfo={IMPACT_TOOLTIP_INFO[legendIndicator]}
    >
      <LegendTypeChoropleth
        className="text-sm text-gray-500 flex-1"
        min={impact.legend.min}
        items={impact.legend.items}
      />
    </LegendItem>
  );
};

export default ImpactLayer;
