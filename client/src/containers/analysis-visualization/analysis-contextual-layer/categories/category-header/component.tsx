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
          'w-4 h-4 my-auto text-xs font-semibold text-center text-white rounded-full',
          visibleLayers === 0 ? 'bg-gray-200' : 'bg-navy-400',
        )}
      >
        {visibleLayers}
      </div>
    </div>
  );
};

export default CategoryHeader;
