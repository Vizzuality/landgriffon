import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

export type CollapseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
};

const ICON_CLASSNAMES = 'h-4 w-4 text-gray-900';

const CollapseButton: React.FC<CollapseButtonProps> = ({
  active,
  onClick,
}: CollapseButtonProps) => (
  <button
    type="button"
    className="rounded-full border border-gray-300 w-10 h-10 flex justify-center items-center bg-white cursor-pointer hover:bg-green-50 hover:border-green-700 focus:outline-none"
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
