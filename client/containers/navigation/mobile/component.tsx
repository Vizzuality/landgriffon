import type { NavigationProps } from 'containers/navigation/types';

const MobileNavigation = ({ items }: NavigationProps) => (
  <nav aria-label="Sidebar" className="mt-5">
    <div className="px-2 space-y-1">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className="group p-2 rounded-md flex items-center text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <item.icon
            className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
          {item.name}
        </a>
      ))}
    </div>
  </nav>
);

export default MobileNavigation;
