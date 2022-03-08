import type { NavigationProps } from 'containers/navigation/types';

const MobileNavigation = ({ items }: NavigationProps) => (
  <nav aria-label="Sidebar" className="mt-5">
    <div className="px-2 space-y-1">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className="group p-2 rounded-md flex items-center text-base font-medium text-white hover:bg-green-600"
        >
          <item.icon className="mr-4 h-6 w-6 text-white" aria-hidden="true" />
          {item.name}
        </a>
      ))}
    </div>
  </nav>
);

export default MobileNavigation;
