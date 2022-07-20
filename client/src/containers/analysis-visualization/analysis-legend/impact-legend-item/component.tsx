import { useCallback, useMemo } from 'react';

import { useAppSelector, useAppDispatch } from 'store/hooks';
import { analysisMap, setLayer } from 'store/features/analysis/map';
import { analysisFilters } from 'store/features/analysis';

import LegendItem from 'components/legend/item';
import LegendTypeChoropleth from 'components/legend/types/choropleth';

const LAYER_ID = 'impact';
const INFO_METADATA = {
  'impact-e2c00251-fe31-4330-8c38-604535d795dc':
    'Blue water footprint or water consumption indicator (m3) measures directly and indirectly the appropriation of freshwater resources. The Blue Water Footprint includes the water that has been sourced from surface or groundwater resources and is either evaporated, incorporated into a product or taken from one body of water and returned to another, or returned at a different time.',
  // Deforestation Loss impact
  'impact-633cf928-7c4f-41a3-99c5-e8c1bda0b323':
    'Forest loss due to land use change (ha) measures the conversion of forest to other land use that has been likely produced due to the presence of nearby commodity driven agriculture, independent whether human induced or not.',
  // Carbon impact
  'impact-c71eb531-2c8e-40d2-ae49-1049543be4d1':
    'Carbon emissions due to land use change (tCO2e) measures the release of biomass carbon associated with the forest that were lost near to a cropland area for a specific agricultural commodity.',
  // Biodiversity impact
  'impact-0594aba7-70a5-460c-9b58-fc1802d264ea':
    "Biodiversity loss due to land use change (PDF) measures the regional species loss, displacement or reduction of species that would otherwise exist in the land if it wouldn't be used for production of certain commodities.",
};

const ImpactLayer = () => {
  const dispatch = useAppDispatch();
  const { indicator } = useAppSelector(analysisFilters);
  const {
    layers: { [LAYER_ID]: impactLayer },
  } = useAppSelector(analysisMap);
  const handleOpacity = useCallback(
    (opacity: number) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { opacity } }));
    },
    [dispatch],
  );

  const handleActive = useCallback(
    (active) => {
      dispatch(setLayer({ id: LAYER_ID, layer: { active } }));
    },
    [dispatch],
  );

  const legendItems = useMemo(
    () =>
      impactLayer.metadata?.legend.items.map((item) => ({
        ...item,
        label: item.label || `${item.value}`,
      })),
    [impactLayer.metadata?.legend.items],
  );

  if (!impactLayer.metadata) return null;
  // TO-DO: add Loading component
  return (
    <LegendItem
      name={impactLayer.metadata.legend.name}
      info={INFO_METADATA[`impact-${indicator?.value}`]}
      {...impactLayer.metadata.legend}
      opacity={impactLayer.opacity}
      active={impactLayer.active}
      onChangeOpacity={handleOpacity}
      onActiveChange={handleActive}
      isLoading={impactLayer.loading}
      main
    >
      <LegendTypeChoropleth
        className="flex-1 text-sm text-gray-500"
        min={impactLayer.metadata.legend.min}
        items={legendItems}
      />
    </LegendItem>
  );
};

export default ImpactLayer;
