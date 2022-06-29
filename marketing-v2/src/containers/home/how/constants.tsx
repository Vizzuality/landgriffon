import MATERIALS_SVG from 'svgs/home/how/icn_materials.svg?sprite';
import VOLUMES_SVG from 'svgs/home/how/icn_volumes.svg?sprite';
import SOURCES_SVG from 'svgs/home/how/icn_sources.svg?sprite';

import UNKNOWN_SVG from 'svgs/home/how/icn_unknown.svg?sprite';
import COUNTRY_SVG from 'svgs/home/how/icn_country.svg?sprite';
import REGION_SVG from 'svgs/home/how/icn_region.svg?sprite';
import FACILITY_SVG from 'svgs/home/how/icn_supplier.svg?sprite';
import FARM_SVG from 'svgs/home/how/icn_farm.svg?sprite';

import LANDSCAPE_SVG from 'svgs/home/how/icn_landscape.svg?sprite';

import WORK_SVG from 'svgs/home/how/icn_work.svg?sprite';
import CHANGE_RECIPES_SVG from 'svgs/home/how/icn_changerecipes.svg?sprite';
import SOURCES2_SVG from 'svgs/home/how/icn_sources2.svg?sprite';

export const IMPORT_DATA_FEATURES = [
  {
    id: 'materials',
    name: 'Materials',
    icon: MATERIALS_SVG,
  },
  {
    id: 'volumes',
    name: 'Volumes',
    icon: VOLUMES_SVG,
  },
  {
    id: 'sources',
    name: 'Sources',
    icon: SOURCES_SVG,
  },
];

export const MAP_SUPPLIERS_FEATURES = [
  {
    id: 'unkown',
    name: 'Unknown',
    icon: UNKNOWN_SVG,
  },
  {
    id: 'country',
    name: 'Country',
    icon: COUNTRY_SVG,
  },
  {
    id: 'region',
    name: 'Region',
    icon: REGION_SVG,
  },
  {
    id: 'facility',
    name: 'Supplier facility',
    icon: FACILITY_SVG,
  },
  {
    id: 'farm',
    name: 'Farm',
    icon: FARM_SVG,
  },
];

export const CALCULATE_IMPACT_FEATURES = [
  {
    id: 'landscape',
    name: 'Landscape-level',
    icon: LANDSCAPE_SVG,
  },
  {
    id: 'farm-level',
    name: 'Farm-level',
    icon: FARM_SVG,
  },
];

export const EXPLORE_FEATURES = [
  {
    id: 'work',
    name: 'Work with suppliers & producers',
    icon: WORK_SVG,
  },
  {
    id: 'change-recipes',
    name: 'Change recipes',
    icon: CHANGE_RECIPES_SVG,
  },
  {
    id: 'source2',
    name: 'Source from more sustainable locations',
    icon: SOURCES2_SVG,
  },
];
