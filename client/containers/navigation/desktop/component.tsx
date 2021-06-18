import type { NavigationProps } from 'containers/navigation/types';

const DesktopNavigation = ({ items }: NavigationProps) => (
  <nav aria-label="Sidebar" className="flex-1 mt-6 w-full px-2 space-y-1">
    {items.map((item) => (
      <a
        key={item.name}
        href={item.href}
        className="text-indigo-100 hover:bg-indigo-800 hover:text-white group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium"
      >
        <item.icon className="text-indigo-300 group-hover:text-white h-6 w-6" aria-hidden="true" />
        <span className="mt-2">{item.name}</span>
      </a>
    ))}
  </nav>
);

export default DesktopNavigation;
