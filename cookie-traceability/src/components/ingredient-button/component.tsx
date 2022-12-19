import type { IngredientButtonProps } from './types';
import classNames from 'classnames';

const IngredientButton: React.FC<IngredientButtonProps> = ({
  id,
  current,
  icon: Icon,
  children,
  ...restProps
}) => (
  <button
    data-id={id}
    type="button"
    className={classNames(
      'w-full p-4 text-sm text-center xl:text-left transition-all border rounded-2xl border-secondary',
      {
        'bg-secondary text-primary': current === id,
      },
    )}
    {...restProps}
  >
    <div
      className={classNames(
        'flex items-center justify-center mx-auto xl:mx-0 mb-2 border rounded-full w-9 h-9',
        {
          'border-primary': current === id,
          'border-secondary': current !== id,
        },
      )}
    >
      <Icon
        className={classNames({
          'fill-primary': current === id,
          'fill-secondary': current !== id,
        })}
      />
    </div>

    <div className="whitespace-nowrap">{children}</div>
  </button>
);

export default IngredientButton;
