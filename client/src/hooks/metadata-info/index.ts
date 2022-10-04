import { useMemo } from 'react';

import type { METADATA_LAYERS, METADATA_INTERVENTIONS } from 'types';

const INFO = {
  LAYERS: {
    material:
      'The material production layers displayed on the map reflect the total commodity production in tonnes for all irrigation technologies in 2010, regardless of the timeframe selected.',
    'Livestock distribution':
      'Global distributions of cattle, water buffalo, sheep, goats, horses, pigs and chickens at the equator in 2010 in total livestock units (LSU).',
    risk: 'The risk layer displayed on the map reflects the environmental impact associated with the provision of a product or service.',
    // IMPACT
    // Water impact
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
    // Land impact
    'Land impact':
      'Land impact (ha) measures the total land that would be used for the production of certain commodities, giving an indicator of land productivity and yields.',
  },
  INTERVENTIONS: {
    // New supplier
    supplier:
      'Change to a new supplier or producer to your organization. If your intervention combines multiple suppliers, all of them will be replaced by the new selected one.',
    // Supplier location
    location:
      'Change to the new location where your supplier is offering the services. If your intervention combines multiple locations, all of them will be replaced by the new selected one.',
    // Supplier impacts per ton
    impacts:
      'Select between the LandGriffon location-based estimates or input your own values to compute the impacts for the selected materials. The Landgriffon location-based estimates are computed using the Landgriffon methodology. To know more about this, please go to the Help section. here.',
    // New material
    material:
      'Change to a new raw material. If your intervention combines multiple raw materials, all of them will be replaced by the newly selected one. If a different volume of the new material is required, enter the ratio of the new tonnage to the old tonnage in “Tons of new material per ton”.',
  },
};

export function useMetadataInterventionsInfo() {
  return useMemo<METADATA_INTERVENTIONS>(() => INFO['INTERVENTIONS'], []);
}

export function useMetadataLayerInfo() {
  return useMemo<METADATA_LAYERS>(() => INFO['LAYERS'], []);
}
