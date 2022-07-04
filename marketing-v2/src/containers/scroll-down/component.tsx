import cx from 'classnames';

import Icon from 'components/icon';

import ARROW_DOWN_SVG from 'svgs/ui/arrow-down.svg?sprite';

interface ScrollDownProps {
  theme: 'light' | 'dark';
}

const ScrollDown: React.FC<ScrollDownProps> = ({ theme }: ScrollDownProps) => {
  return (
    <div className="absolute top-0 left-0 z-20 hidden w-full h-full pointer-events-none xl:block">
      <div className="absolute -right-10 bottom-40 animate-bounce">
        <div className="-rotate-90 ">
          <div className="flex items-center space-x-5">
            <Icon
              icon={ARROW_DOWN_SVG}
              className={cx({
                'w-5 h-5 rotate-90': true,
                'fill-white': theme === 'dark',
                'fill-black': theme === 'light',
              })}
            />
            <span
              className={cx({
                'block text-xs uppercase': true,
                'text-white': theme === 'dark',
                'text-black': theme === 'light',
              })}
            >
              Scroll down
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollDown;
