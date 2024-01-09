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
    <nav aria-label="Sidebar" className="w-full space-y-4 px-4">
      {items.map((item) => {
        const isActive = isCurrentItem(item.href);
        return (
          <a
            key={item.name}
            href={item.disabled ? '' : item.href}
            className={classNames(
              'flex h-[86px] w-full flex-col items-center justify-center rounded-md text-xs font-medium text-white transition-colors hover:bg-black/30 focus-visible:shadow-button-focused focus-visible:outline-none ',
              {
                'bg-black/30': isCurrentItem(item.href),
                'pointer-events-none cursor-not-allowed opacity-50': item.disabled,
              },
            )}
          >
            {isActive ? (
              <item.icon.active strokeWidth={1.5} className="h-6 w-6" aria-hidden="true" />
            ) : (
              <item.icon.default strokeWidth={1.5} className="h-6 w-6" aria-hidden="true" />
            )}
            <span className="mt-2">{item.name}</span>
          </a>
        );
      })}
    </nav>
  );
};

export default DesktopNavigation;
