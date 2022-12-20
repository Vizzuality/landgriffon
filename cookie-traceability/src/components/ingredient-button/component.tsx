import classNames from 'classnames';

import { useRive } from '@rive-app/react-canvas';

import type { IngredientButtonProps } from './types';
import { useCallback } from 'react';

const IngredientButton: React.FC<IngredientButtonProps> = ({
  id,
  current,
  children,
  ...restProps
}) => {
  const { rive, RiveComponent } = useRive({
    src: `/images/${id}.riv`,
    autoplay: false,
  });

  const handleMouseEnter = useCallback(() => {
    if (!rive?.isPlaying) {
      rive?.reset();
      rive?.play();
    }
  }, [rive]);

  return (
    <button
      data-id={id}
      type="button"
      className={classNames(
        'w-full py-4 px-2 md:px-4 pb-5 text-sm text-center xl:text-left transition-colors border rounded-[32px] bg-transparent border-secondary',
        {
          'bg-secondary text-primary': current === id,
          'hover:bg-secondary/25': current !== id,
        },
      )}
      onMouseEnter={handleMouseEnter}
      {...restProps}
    >
      <div
        className={classNames(
          'flex items-center justify-center mx-auto xl:mx-0 mb-2 border rounded-full w-9 h-9 bg-secondary',
          {
            'border-primary': current === id,
            'border-secondary': current !== id,
          },
        )}
      >
        <RiveComponent />
      </div>

      <div className="whitespace-nowrap">{children}</div>
    </button>
  );
};

export default IngredientButton;
