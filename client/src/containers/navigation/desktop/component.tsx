import { useRouter } from 'next/router';
import classNames from 'classnames';

import type { NavigationProps } from 'containers/navigation/types';

const DesktopNavigation: React.FC<NavigationProps> = ({ items }: NavigationProps) => {
  const { route } = useRouter();

  const isCurrentItem = (href: string): boolean => {
    if (href === '/' && route !== '/') return false;
    const matcher = new RegExp(`^\/?${href}\/?.*$`);
    return matcher.test(route);
  };

  return (
    <nav aria-label="Sidebar" className="flex-1 mt-6 w-full px-2 space-y-1">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className={classNames(
            'text-white hover:bg-black/20 group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium transition-colors',
            { 'bg-black/20': isCurrentItem(item.href) },
          )}
        >
          <item.icon className="h-6 w-6" aria-hidden="true" />
          <span className="mt-2">{item.name}</span>
        </a>
      ))}
    </nav>
  );
};

export default DesktopNavigation;
