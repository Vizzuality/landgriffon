import type { NavigationProps } from 'containers/navigation/types';

const NavigationError: React.FC<NavigationProps> = ({ items }: NavigationProps) => {
  return (
    <div className="flex pt-10">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className="flex w-full flex-col items-center rounded-md p-3 text-xs font-medium text-green-800 hover:bg-green-800 hover:text-white"
        >
          <item.icon.default className="h-6 w-6" aria-hidden="true" />
          <span className="mt-2">{item.name}</span>
        </a>
      ))}
    </div>
  );
};

export default NavigationError;
