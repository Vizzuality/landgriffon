const ButtonGroup: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="relative flex rounded-md border border-gray-200 bg-white shadow-sm">
    {children}
  </div>
);

export default ButtonGroup;
