import type { NavigationProps } from 'containers/navigation/types';

const DesktopNavigation = ({ items }: NavigationProps) => (
  <nav aria-label="Sidebar" className="flex-1 mt-6 w-full px-2 space-y-1">
    {items.map((item) => (
      <a
        key={item.name}
        href={item.href}
        className="text-white hover:bg-green-800 group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium"
      >
        <item.icon className="h-6 w-6" aria-hidden="true" />
        <span className="mt-2">{item.name}</span>
      </a>
    ))}
  </nav>
);

export default DesktopNavigation;
