import { useRouter } from 'next/router';
import classNames from 'classnames';

import type { NavigationProps } from 'containers/navigation/types';

const DesktopNavigation: React.FC<NavigationProps> = ({ items }: NavigationProps) => {
  const { route } = useRouter();

  return (
    <nav className="flex w-full px-2 mt-6 space-y-1">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className={classNames(
            'text-green-800  group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium',
            { 'bg-green-800': item.href === route },
          )}
        >
          <item.icon className="w-6 h-6" aria-hidden="true" />
          <span className="mt-2">{item.name}</span>
        </a>
      ))}
    </nav>
  );
};

export default DesktopNavigation;
