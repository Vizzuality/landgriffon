import EVALUATE_SVG from 'svgs/evaluate.svg';
import IMPROVE_SVG from 'svgs/improve.svg';
import LOCATE_SVG from 'svgs/locate.svg';

export const FEATURES = [
  {
    key: 0,
    title: 'Locate',
    description:
      'LandGriffon combines data on company raw material purchases with production statistics, trade data, and other geospatial sources to create a map of each supplier and where each raw material is most likely to have been produced.',
    icon: LOCATE_SVG,
  },
  {
    key: 1,
    title: 'Evaluate',
    description:
      'Sourcing locations are then combined with leading scientific and NGO data on environmental impacts and risks. Custom data sources and methods can be added to track specific metrics or targets that you might have.',
    icon: EVALUATE_SVG,
  },
  {
    key: 2,
    title: 'Improve',
    description:
      'As you get better data about your suppliers, their practices, and where they in turn source from, LandGriffon can improve its estimates of your impacts and risks.',
    icon: IMPROVE_SVG,
  },
];

export default FEATURES;
