import classNames from 'classnames';

import type { CategoryWithLayers } from 'hooks/layers/getContextualLayers';

const CategoryHeader: React.FC<{
  category: CategoryWithLayers['category'];
  visibleLayers: number;
}> = ({ category, visibleLayers }) => {
  return (
    <div className="flex flex-row justify-between" data-testid={`category-header-${category}`}>
      <div className="text-sm font-semibold text-gray-500">{category}</div>
      <div
        className={classNames(
          'my-auto h-4 w-4 rounded-full text-center text-xs font-semibold text-white',
          visibleLayers === 0 ? 'bg-gray-200' : 'bg-navy-400',
        )}
      >
        {visibleLayers}
      </div>
    </div>
  );
};

export default CategoryHeader;
