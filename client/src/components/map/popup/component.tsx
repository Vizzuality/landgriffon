import classNames from 'classnames';
import type { PopUpProps } from './types';

const PADDING_SIZE = 100;
const OFFSET = 10;

const PopUp = ({ children, position: { x, y, width, height } }: PopUpProps) => {
  const withinXLimit = width - PADDING_SIZE > x;
  const withinYLimit = height - (height - y) < PADDING_SIZE;

  return (
    <div
      className={classNames('absolute z-10 pointer-events-none transform', {
        '-translate-y-full': !withinYLimit,
        '-translate-x-full': !withinXLimit,
      })}
      style={{
        top: y - OFFSET,
        left: withinXLimit ? x + OFFSET : 'auto',
        right: withinXLimit ? 'auto' : width - x - PADDING_SIZE + OFFSET,
      }}
    >
      {children}
    </div>
  );
};

export default PopUp;
