const NavigationError = ({ navigationItems }) => (
  <div className="flex bg-white bottom-7">
    {navigationItems.map((item) => (
      <a
        key={item.name}
        href={item.href}
        className="flex flex-col items-center w-full p-3 text-xs font-medium text-green-800 rounded-md"
      >
        <item.icon className="w-6 h-6" aria-hidden="true" />
        <span className="mt-2">{item.name}</span>
      </a>
    ))}
  </div>
);

export default NavigationError;
