const ButtonGroup: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="relative z-0 inline-flex bg-white border border-gray-300 rounded-md shadow-sm">
    {children}
  </div>
);

export default ButtonGroup;
