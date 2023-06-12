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
    <nav aria-label="Sidebar" className="w-full px-2 space-y-1">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.disabled ? '' : item.href}
          className={classNames(
            'text-white group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium transition-colors',
            {
              'bg-black/30': isCurrentItem(item.href),
              'opacity-50 cursor-not-allowed pointer-events-none': item.disabled,
            },
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
