import type { NavigationProps } from 'containers/navigation/types';

const DesktopNavigation = ({ items }: NavigationProps) => (
  <nav aria-label="Sidebar" className="py-6 flex flex-col items-center space-y-3">
    {items.map((item) => (
      <a
        key={item.name}
        href={item.href}
        className="flex items-center p-4 rounded-lg text-indigo-200 hover:bg-indigo-700"
      >
        <item.icon className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">{item.name}</span>
      </a>
    ))}
  </nav>
);

export default DesktopNavigation;
