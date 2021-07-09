import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

export type CollapseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
};

const ICON_CLASSNAMES = 'h-4 w-4 text-green-700';

const CollapseButton: React.FC<CollapseButtonProps> = ({
  active,
  onClick,
}: CollapseButtonProps) => (
  <button
    type="button"
    className="rounded-full border-2 border-gray-100 w-11 h-11 flex justify-center items-center bg-white cursor-pointer hover:bg-green-50 hover:border-green-700 focus:outline-none"
    onClick={onClick}
  >
    {active ? (
      <ChevronRightIcon className={ICON_CLASSNAMES} />
    ) : (
      <ChevronLeftIcon className={ICON_CLASSNAMES} />
    )}
  </button>
);

export default CollapseButton;
