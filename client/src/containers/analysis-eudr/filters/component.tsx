import MoreFilters from './more-filters';
import YearsRange from './years-range';

const EUDRFilters = () => {
  return (
    <div className="flex space-x-2">
      <YearsRange />
      <MoreFilters />
    </div>
  );
};

export default EUDRFilters;
