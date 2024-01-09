import type { NavigationProps } from 'containers/navigation/types';

const MobileNavigation = ({ items }: NavigationProps) => (
  <nav aria-label="Sidebar" className="mt-5">
    <div className="space-y-1 px-2">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className="hover:bg-green-600 group flex items-center rounded-md p-2 text-base font-medium text-white"
        >
          <item.icon.default className="mr-4 h-6 w-6 text-white" aria-hidden="true" />
          {item.name}
        </a>
      ))}
    </div>
  </nav>
);

export default MobileNavigation;
