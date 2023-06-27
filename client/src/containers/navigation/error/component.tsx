import type { NavigationProps } from 'containers/navigation/types';

const NavigationError: React.FC<NavigationProps> = ({ items }: NavigationProps) => {
  return (
    <div className="flex pt-10">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className="flex flex-col items-center w-full p-3 text-xs font-medium text-green-800 rounded-md hover:bg-green-800 hover:text-white"
        >
          <item.icon.default className="w-6 h-6" aria-hidden="true" />
          <span className="mt-2">{item.name}</span>
        </a>
      ))}
    </div>
  );
};

export default NavigationError;
