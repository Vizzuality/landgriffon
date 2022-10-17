const ButtonGroup: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="relative flex bg-white border border-gray-200 rounded-md shadow-sm">
    {children}
  </div>
);

export default ButtonGroup;
